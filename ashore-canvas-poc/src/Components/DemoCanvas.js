import React, { useLayoutEffect, useState, useEffect, useRef } from 'react'

const DemoCanvas = () => {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [activeTool, setActiveTool] = useState(null) // New state to track current drawing tool
  const [shapes, setShapes] = useState(JSON.parse(sessionStorage.getItem('shapes')) || []) // State to store drawn shapes
  const [isDrawing, setIsDrawing] = useState(false) // Track if the user is drawing
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 }) // Start point for rectangle
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 }) // Current mouse point during drawing
  const [freeFormPoints, setFreeFormPoints] = useState([]) // Store points for free shape
  const [selectedPoint, setSelectedPoint] = useState()
  const canvasRef = useRef()
  //   console.log('shapes - ', shapes)

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.src =
    //   'https://images.pexels.com/photos/7110193/pexels-photo-7110193.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    'https://media.ashoreapp.com/staging/ashore/58a338bcbccfc0bc57498456accb0d4ad8e7ebc1/proof_files/4ec4d5e6-ddfa-4223-beff-e3b325f3f045'

    //   ctx.globalAlpha = 0.5 transparency

    img.onload = () => {
      setImageLoaded(true)

      // Clear the entire canvas before applying new transformations
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Reset transformations before applying new ones
      ctx.resetTransform()

      // Apply zoom and pan
      ctx.translate(panOffset.x / zoom, panOffset.y / zoom)
      ctx.scale(zoom, zoom)

      // Draw the image on the canvas
      ctx.drawImage(img, 10, 10, 700, 500)

      // Draw all stored shapes (rectangles, free shapes, circles)
      shapes.forEach(shape => {
        if (shape.type === 'rectangle') {
          //   ctx.fillStyle = shape.color
          //   ctx.strokeStyle = shape.color
          //   ctx.beginPath()
          //   ctx.moveTo(shape.x, shape.y)
          //   ctx.lineTo(shape.x + shape.width, shape.y)
          //   ctx.lineTo(shape.x + shape.width, shape.y + shape.height)
          //   ctx.lineTo(shape.x, shape.y + shape.height)
          //   ctx.lineTo(shape.x, shape.y)
          //   ctx.stroke()

          ctx.strokeStyle = shape.color
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)

          //   below will create a rectangle with background color
          //   ctx.fillStyle = shape.color
          //   ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
        } else if (shape.type === 'freeform') {
          ctx.strokeStyle = shape.color
          ctx.beginPath()
          shape.points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y)
            } else {
              ctx.lineTo(point.x, point.y)
            }
          })
          ctx.stroke()
        } else if (shape.type === 'circle') {
          // Draw circles with a border and number inside
          const isSelected = shape.number === selectedPoint
          ctx.strokeStyle = 'black' // Border color
          //   ctx.fillStyle = shape.color // Fill color
          ctx.fillStyle = isSelected ? 'yellow' : 'lightyellow'
          ctx.beginPath()
          ctx.arc(shape.x, shape.y, 15, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()

          // Draw the number inside the circle
          ctx.fillStyle = 'black' // Number color
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(shape.number, shape.x, shape.y)
        }
      })

      // Preview for shapes being drawn...
      if (activeTool === 'rectangle' && isDrawing) {
        const width = currentPoint.x - startPoint.x
        const height = currentPoint.y - startPoint.y
        ctx.strokeStyle = 'blue'
        ctx.strokeRect(startPoint.x, startPoint.y, width, height)
      }

      if (activeTool === 'freeform' && isDrawing) {
        ctx.strokeStyle = 'red'
        ctx.beginPath()
        freeFormPoints.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
      }
    }
  }, [panOffset, zoom, imageLoaded, shapes, isDrawing, currentPoint, freeFormPoints, selectedPoint])

  const getMousePosition = event => {
    const canvas = document.getElementById('canvas')
    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left - panOffset.x
    const mouseY = event.clientY - rect.top - panOffset.y
    return { mouseX, mouseY }
  }

  const handleMouseDown = event => {
    const { mouseX, mouseY } = getMousePosition(event)

    setIsDrawing(true)
    setStartPoint({ x: mouseX, y: mouseY })

    if (activeTool === 'freeform') {
      setFreeFormPoints([{ x: mouseX, y: mouseY }]) // Start collecting points for freeform shape
    }
  }

  const handleMouseMove = event => {
    if (!isDrawing) return
    const { mouseX, mouseY } = getMousePosition(event)

    setCurrentPoint({ x: mouseX, y: mouseY })

    if (activeTool === 'freeform') {
      setFreeFormPoints(prevPoints => [...prevPoints, { x: mouseX, y: mouseY }]) // Add points while dragging
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)

    if (activeTool === 'rectangle') {
      const width = currentPoint.x - startPoint.x
      const height = currentPoint.y - startPoint.y
      setShapes([
        ...shapes,
        { type: 'rectangle', x: startPoint.x, y: startPoint.y, width, height, color: 'blue' }
      ])
    } else if (activeTool === 'freeform') {
      setShapes([...shapes, { type: 'freeform', points: freeFormPoints, color: 'red' }])
    }
  }

  const getCurrentPoint = (mouseX, mouseY) => {
    console.log('mouseX, mouseY ', mouseX, mouseY)
    console.log('shapes - ', shapes)

    return shapes.find(
      ({ x, y, radius }) =>
        x - radius / 2 <= mouseX &&
        mouseX <= x + radius / 2 &&
        y - radius / 2 <= mouseY &&
        mouseY <= y + radius / 2
    )
  }

  const handleCanvasClick = event => {
    if (activeTool) return
    const { mouseX, mouseY } = getMousePosition(event)

    const currentPoint = getCurrentPoint(mouseX, mouseY)
    currentPoint && console.log('CLICK ON -- ', currentPoint.number)

      currentPoint &&
      setSelectedPoint(selectedPoint === currentPoint.number ? null : currentPoint.number)
    // console.log('ref -- ', canvasRef.current.clientX)
    if (currentPoint) return

    // Add a circle with a number starting from 1 and increasing for each new click
    const circleNumber = shapes.filter(shape => shape.type === 'circle').length + 1
    const newCircle = {
      type: 'circle',
      x: mouseX,
      y: mouseY,
      radius: 15, // Radius of the circle
      color: 'yellow', // Circle color
      number: circleNumber // Number displayed inside the circle
    }
    setSelectedPoint(circleNumber)

    setShapes([...shapes, newCircle])
  }

  useEffect(() => {
    const canvas = document.getElementById('canvas')

    const handleOnWheel = event => {
      event.preventDefault() // Prevent the default browser zoom behavior

      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left // current mouse position
      const mouseY = event.clientY - rect.top

      if (event.ctrlKey) {
        const zoomFactor = event.deltaY * -0.01 // Adjust zoom sensitivity
        const newZoom = Math.max(0.1, zoom + zoomFactor) // Calculate new zoom

        // Adjust panOffset to zoom towards the mouse position
        setPanOffset(prevOffset => ({
          x: mouseX - (mouseX - prevOffset.x) * (newZoom / zoom),
          y: mouseY - (mouseY - prevOffset.y) * (newZoom / zoom)
        }))

        setZoom(newZoom) // Update zoom state
      } else {
        // Pan functionality
        setPanOffset(prevState => ({
          x: prevState.x - event.deltaX,
          y: prevState.y - event.deltaY
        }))
      }
    }

    canvas.addEventListener('wheel', handleOnWheel)

    return () => {
      canvas.removeEventListener('wheel', handleOnWheel)
    }
  }, [zoom])

  useEffect(() => {
    sessionStorage.setItem('shapes', JSON.stringify(shapes))
  }, [shapes])

  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center'>
      <div className='flex space-x-4 mb-4'>
        <button
          className={`px-4 py-2 bg-blue-400 text-white rounded ${
            activeTool === 'rectangle' ? 'border border-blue-600' : ''
          }`}
          onClick={() => {
            setActiveTool(activeTool === 'rectangle' ? '' : 'rectangle')
          }}
        >
          Draw Rectangle
        </button>
        <button
          className={`px-4 py-2 bg-red-400 text-white rounded ${
            activeTool === 'freeform' ? 'border border-red-600' : ''
          }`}
          onClick={() => setActiveTool(activeTool === 'freeform' ? '' : 'freeform')}
        >
          Draw Free Shape
        </button>
        <button
          className='px-4 py-2 bg-gray-500 text-white rounded'
          onClick={() => {
            sessionStorage.clear()
            window.location.reload()
          }}
        >
          Clear
        </button>
      </div>
      {/* <div className='w-[50vw] h-[50vh] overflow-auto'> */}
        <canvas
          ref={canvasRef}
          id='canvas'
          width='1000'
          height='600'
          className=' bg-gray-100 rounded border'
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick} // Handle clicks to add numbered circles
        >
          Canvas
        </canvas>
      {/* </div> */}
    </div>
  )
}

export default DemoCanvas
