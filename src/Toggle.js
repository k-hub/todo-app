import React, { Component } from 'react';

class Toggle extends Component {
/**
  * Example cases of when canToggleOn is true/false:
  *   - create a todo: When all todos are marked completed and
  *       a new todo is added -> canToggleOn to true.
  *   - delete a todo: When the remaining todos are marked completed and
  *       deleted todo was incomplete -> canToggleOn to false.
  *   - batch delete todos: When all todos are marked completed and
  *       then cleared -> canToggleOn to false.
  *   - toggle individual todo: When there's one todo and it has been marked
  *       completed -> canToggleOn to false.
 */
  _handleOnToggleAll = () => {
    const totalTodos = this.props.totalTodos;
    const totalCompletedTodos = this.props.totalCompletedTodos;
    let canToggleOn = false;

    if (totalTodos > 0 && totalTodos !== totalCompletedTodos) {
      canToggleOn = true;
    }

    this.props.onClick(canToggleOn);
  }

  render() {
    const totalTodos = this.props.totalTodos;
    const totalCompletedTodos = this.props.totalCompletedTodos;
    return(
      <span>
        {totalTodos > 0 && (
          <span
            className={totalTodos > 0 && totalTodos === totalCompletedTodos ? 'toggle-all-icon selected' : 'toggle-all-icon'}
            onClick={this._handleOnToggleAll}></span>
        )}
      </span>
    )
  }
}

export default Toggle;
