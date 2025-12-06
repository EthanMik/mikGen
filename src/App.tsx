import './App.css'
import FieldContainer from './components/FieldContainer'
import PathConfig from './components/PathMenu/PathConfig'
import PathSimulator from './components/PathSimulator'
import ControlConfig from './components/ControlConfig'
import Config from './components/Config/Config'

function App() {
  return (
    <div className='flex flex-row'>
      <div className='flex flex-col gap-[10px] pl-[10px] pt-[10px]'>
        <Config/>
        <FieldContainer/>
        <PathSimulator/>
      </div>
      <div className='flex flex-col gap-[10px] pt-[10px] pl-[10px]'>
        <PathConfig/>
        <ControlConfig/>
      </div>
    </div>
  )
}

export default App  