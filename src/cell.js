import React from 'react'
export default class Cell extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false,
      value: props.value,
    }
    this.display = this.determineDisplay(
      { x: props.x, y: props.y },
      props.value
    )
    this.timer = 0
    this.delay = 200
    this.prevent = false
  }

  componentDidMount() {
    window.document.addEventListener('unselectAll',
      this.handleUnselectAll)
  }

  componentWillUpdate() {
    this.display = this.determineDisplay(
      { x: this.props.x, y: this.props.y }, this.state.value)
  }

  componentWillUnmount() {
    window.document.removeEventListener('unselectAll',
      this.handleUnselectAll)
  }

  onChange = (e) => {
    this.setState({ value: e.target.value })
    this.display = this.determineDisplay(
      { x: this.props.x, y: this.props.y }, e.target.value)
  }

  onKeyPressOnInput = (e) => {
    if (e.key === 'Enter') {
      this.hasNewValue(e.target.value)
    }
  }

  onKeyPressOnSpan = () => {
    if (!this.state.editing) {
      this.setState({ editing: true })
    }
  }

  onBlur = (e) => {
    this.hasNewValue(e.target.value)
  }

  handleUnselectAll = () => {
    if (this.state.selected || this.state.editing) {
      this.setState({ selected: false, editing: false })
    }
  }

  hasNewValue = (value) => {
    this.props.onChangedValue(
      {
        x: this.props.x,
        y: this.props.y,
      },
      value,
    )
    this.setState({ editing: false })
  }

  emitUnselectAllEvent = () => {
    const unselectAllEvent = new Event('unselectAll')
    window.document.dispatchEvent(unselectAllEvent)
  }

  clicked = () => {

    this.timer = setTimeout(() => {
      if (!this.prevent) {

        this.emitUnselectAllEvent()
        this.setState({ selected: true })
      }
      this.prevent = false
    }, this.delay)
  }

  doubleClicked = () => {

    clearTimeout(this.timer)
    this.prevent = true

    this.emitUnselectAllEvent()
    this.setState({ editing: true, selected: true })
  }
  determineDisplay = ({ x, y }, value) => {
    if (value.slice(0, 1) === '=') {
      const res = this.props.executeFormula({ x, y }, value.slice(1))
      if (res.error !== null) {
        return 'INVALID'
      }
      return res.result
    }
    return value
  }

  getCss = () => {
    const css = {
      width: '80px',
      padding: '4px',
      margin: '0',
      height: '25px',
      boxSizing: 'border-box',
      position: 'relative',
      display: 'inline-block',
      color: 'black',
      border: '1px solid #cacaca',
      textAlign: 'left',
      verticalAlign: 'top',
      fontSize: '14px',
      lineHeight: '15px',
      overflow: 'hidden',
      fontFamily: 'Calibri, \'Segoe UI\', Thonburi,Arial,Verdana,sans-serif',

    }
    if (this.props.x === 0 || this.props.y === 0) {
      css.textAlign = 'center'
      css.backgroundColor = '#f0f0f0'
      css.fontWeight = 'bold'
    }
    return css
  }
  render() {
    const css = this.getCss()

    if (this.props.x === 0) {
      return (
        <span style={css}>
          {this.props.y}
        </span>
      )
    }

    if (this.props.y === 0) {
      const alpha = ' abcdefghijklmnopqrstuvwxyz'.split('')
      return (
        <span
          onKeyPress={this.onKeyPressOnSpan}
          style={css}
          role="presentation">
          {alpha[this.props.x]}
        </span>
      )
    }
    if (this.state.selected) {
      css.outlineColor = 'lightblue'
      css.outlineStyle = 'dotted'
    }
    if (this.state.editing) {
      return (
        <input
          style={css}
          type="text"
          onBlur={this.onBlur}
          onKeyPress={this.onKeyPressOnInput}
          value={this.state.value}
          onChange={this.onChange}
          autoFocus
        />
      )
    }
    return (
      <span
        onClick={e => this.clicked(e)}
        onDoubleClick={e => this.doubleClicked(e)}
        style={css}
        role="presentation"
      >
        {this.display}
      </span>
    )
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   // Has a formula value? could be affected by any change. Update
  //   if (this.state.value !== '' &&
  //       this.state.value.slice(0, 1) === '=') {
  //     return true
  //   }
  //   // Its own state values changed? Update
  //   // Its own value prop changed? Update
  //   if (nextState.value !== this.state.value ||
  //       nextState.editing !== this.state.editing ||
  //       nextState.selected !== this.state.selected ||
  //       nextProps.value !== this.props.value) {
  //     return true
  //   }
  //   return false
  // }
}
