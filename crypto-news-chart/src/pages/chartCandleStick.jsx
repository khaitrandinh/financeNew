// // NewsChart.jsx
import { useEffect, useRef, useState } from 'react'
import { init, dispose, registerOverlay } from "klinecharts";


export default function NewsChart() {
  const [kline, setKline] = useState([])
  const chartRef = useRef(null)
  const containerId = 'news-chart'
  const [newData, setNewsData] = useState([ ]);
  
  useEffect(() => {
    (async () => {
      try {
        const nowSec = Math.floor(Date.now() / 1000)
        const url = 
          `https://datav2.nami.exchange/api/v1/chart/history` +
          `?symbol=BTCUSDT&resolution=1h&broker=NAMI_FUTURES&from=1577836800&to=${nowSec}`
        
        const response = await fetch(url)
        const raw = await response.json()

        const kl = raw.map(r => ({
          timestamp: r[0] * 1000,
          open: +r[1],
          high: +r[2],
          low: +r[3],
          close: +r[4],
          volume: +r[6]
        }))
        
        setKline(kl)
      } catch (err) {
        console.error('Fetch k-line error:', err)
      }
    })()
  }, [])
  useEffect(() => {
    const fetchNewsData = async () => {
      try {

        const response = await fetch(`https://finance-new-8ly5.vercel.app/api/news`)
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`)
        }

        const result = await response.json()
        
        setNewsData(result)
      } catch (error) {
        console.error(' Error fetching news data:', error)
      }
    }

    fetchNewsData()
  }, [])

  // console.log('Fetching news title:', newData?.results?.[0]?.title || 'Không có tiêu đề');
  
  useEffect(() => {

  if (!chartRef.current) {
    chartRef.current = init(containerId)
  }
  const chart = chartRef.current
  chart.applyNewData(kline) 
  chart.removeOverlay()

  const newsData = (newData?.results || []).map(item => ({
    title: item.title,
    timestamp: new Date(item.published_at).getTime(),
    link: item.url
  }))

  const newsEvents = newsData.map(event => {
    const matched = kline.reduce((prev, curr) =>
      Math.abs(curr.timestamp - event.timestamp) < Math.abs(prev.timestamp - event.timestamp)
        ? curr : prev
    , kline[0])

    return {
      ...event,
      mappedTimestamp: matched.timestamp,
      price: matched.high
    }
  })

  newsEvents.forEach((event, i) => {
      try {  
        // console.log('Creating news:' , event.title)
        // console.log('Creating news:' , event.link)
        // console.log(`Creating news ${i}: ${event.timestamp} at`, new Date(event.timestamp))
        //*[@id="detail_pane"]/div[1]/h1/a[2]
        // registerOverlay({
        //     name: 'TextOverlay-Title',
        //     totalStep: 2,
        //     createPointFigures: ({ coordinates }) => {
        //         return {
        //             type: 'text',
        //             attrs: {
        //                 x: coordinates[0].x - 200,
        //                 y: coordinates[0].y - 155,
        //                 width: 350,
        //                 height: 30,
        //                 text: `${event.title}` ,
                            
        //             },
        //             styles: {  
        //                 color: '#FFFFFF',
        //                 size: 15,
        //                 backgroundColor: 'transparent',
        //                 // backgroundColor: '#8aa694',
        //                 opacity: 0.8,
        //             },
        //             ignoreEvent:  true,// Ignore mouse events for this text               
        //         }
        //     }
        // });
        registerOverlay({
            name: 'TextOverlay-Date',
            totalStep: 2,
            createPointFigures: ({ coordinates }) => {
                return {
                    type: 'text',
                    attrs: {
                        x: coordinates[0].x - 300,
                        y: coordinates[0].y - 160,
                        width: 200,
                        height: 20,
                        text: `${event.timestamp ? new Date(event.timestamp).toUTCString() : ''}` ,
                            
                    },
                    styles: {  
                        color: '#FFFFFF',
                        backgroundColor: 'transparent',                      
                        opacity: 0.8,
                    },  
                    ignoreEvent:  true,
                                      
                }
                
            }
        });
        // registerOverlay({
        //   name: 'TextOverlay-Link',
        //   totalStep: 1,
        //   needDefaultPointFigure: false,

        //   createPointFigures: ({ coordinates }) => {
        //     const [coord] = coordinates
        //     if (!coord) return []

        //     return [{
        //       type: 'text',
        //       attrs: {
        //         x: coord.x - 280,
        //         y: coord.y - 150,
        //         text: 'Click to read more'
        //       },
        //       styles: {
        //         color: '#00BFFF',
        //         backgroundColor: 'transparent',
        //         font: 'bold 14px sans-serif',
        //         opacity: 0.8
        //       },
              
        //     }]
        //   },
        //   onClick: () => {
        //         console.log(`Opened link for event: ${event.text}`)
        //         window.open(event.link, '_blank')
        //       },
        // });
        registerOverlay({
          name: 'TextOverlay-Link1',
          totalStep: 2,
          styles: {
            line: { style: 'dashed' }
          },
          createPointFigures: ({ overlay, coordinates }) => {
            let text = ''
            if (overlay.extendData !== undefined && overlay.extendData !== null) {
              if (typeof overlay.extendData !== 'function') {
                text = (overlay.extendData ?? '')
              } else {
                text = overlay.extendData(overlay);
              }
            }
            const startX = coordinates[0].x 
            const startY = coordinates[0].y - 2
            const lineEndY = startY - 50
            const arrowEndY = lineEndY - 5
            return [
              {
                type: 'line',
                attrs: { coordinates: [{ x: startX, y: startY }, { x: startX, y: lineEndY }] },
                ignoreEvent: true
              },
              {
                type: 'polygon',
                attrs: { coordinates: [{ x: startX, y: lineEndY }, { x: startX - 4, y: arrowEndY }, { x: startX + 4, y: arrowEndY }] },
                ignoreEvent: true
              },
              {
                type: 'text',
                attrs: { x: startX, y: arrowEndY, text, align: 'center', baseline: 'bottom' },
                ignoreEvent: false
              }
            ]
          },         
        });
          
        chart.createOverlay({
          name: 'simpleAnnotation',
          points: [{ 
            timestamp: event.mappedTimestamp, 
            value: event.price + 500
          }],
          extendData:event.title,
          totalStep: 1,
          mode: 'normal',  
          
          styles: {
            text: {
              color: '#ffffff',
              backgroundColor: '#183B4E',
              size: 15,
              font: 'bold 14px sans-serif',
              borderRadius: 4,
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 50,
              opacity: 1
            },
            line:{
              color: '#183B4E',
            },
            polygon: {
              color: '#183B4E', 
              backgroundColor: '#183B4E',
            }
              
          },                     
        })
        chart.createOverlay({
          name: 'simpleAnnotation',
          points: [{ 
            timestamp: event.mappedTimestamp - 10000, 
            value: event.price + 250
          }],
          extendData:`${event.timestamp ? new Date(event.timestamp).toUTCString() : ''}`,
          totalStep: 1,
          mode: 'normal',  
          
          styles: {
            text: {
              color: '#ffffff',
              backgroundColor: 'transparent',
              borderRadius: 4,
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 50,
              opacity: 1
            },
            line:{
              color: 'transparent',
            },
            polygon: {
              color: 'transparent', 
              backgroundColor: '#transparent',
            }
              
          },              
        
        })
  

        chart.createOverlay({
          name: 'TextOverlay-Link1',
          points: [{
            timestamp: event.mappedTimestamp,
            value: event.price
          }],
          extendData: `Click to read more` ,
          styles: {
            text: {
              color: '#00BFFF',
              backgroundColor: 'transparent',
              size: 15,
              font: 'bold 14px sans-serif',
              borderRadius: 4,
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 50,
              opacity: 1
            },
            line: {
              color: 'transparent',
            },
            polygon: {
              color: 'transparent',
              backgroundColor: 'transparent',
            }
          },
          // Sử dụng onPressed thay vì onClick
          onClick: () => {
            console.log(`Opened link for event: ${event.title}`)   
            window.open(event.link, '_blank')         
          }, 
        });
        // console.log('overlay ID:', chart.getOverlays())
        
      

        // chart.createOverlay({
        //     name: 'TextOverlay-Title',
        //     points: [{ timestamp: event.mappedTimestamp  , value: event.price }],            
            
        // });
        // chart.createOverlay({
        //     name: 'TextOverlay-Date',
        //     points: [{ timestamp: event.mappedTimestamp  , value: event.price }],   
        // });
        // chart.createOverlay({
        //     name: 'TextOverlay-Link',
        //     points: [{ timestamp: event.mappedTimestamp  , value: event.price }],  
        //     extendData: { link: event.link } 
        // });

        
        const segmentId = chart.createOverlay({
          name: 'segment',
          points: [
            { timestamp: event.mappedTimestamp, value: event.price },
            { timestamp: event.mappedTimestamp, value: event.price + 1000 }
          ],
          
          styles: {
            line: {
              borderStyle: 'solid',
              color: '#27548A',
              borderSize: 2,
              // borderColor: '#27548A',
            }
          },
          onClick: () => {
            chart.removeOverlay({ name: 'simpleAnnotation' });
          }
        })

        console.log(`segment ${i} ID:`, segmentId)

      } catch (error) {
        console.error(`Error creating overlay ${i}:`, error)
      }
    })

}, [kline, newData])

  // Cleanup
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        dispose(containerId)
        chartRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h3>BTC/USDT – News with Built-in Overlays</h3>
      <div id={containerId} style={{  width: "100%", height: 800  }} />
      
    </div>
  )
}


