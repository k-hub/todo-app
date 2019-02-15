import React, { Component } from 'react';
import Toggle from './Toggle.js';
import './App.css';

const keysToIgnore = ['inputValue'];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: new Map(),
      inputValue: '',
      nowShowing: 'all',
    };
  }

  /**
   * Load previous saved state in sessionStorage.
   */
  hydrateState() {
    for (let key in this.state) {
      if (sessionStorage.hasOwnProperty(key)) {
        let value = sessionStorage.getItem(key);
        value = JSON.parse(value);
        this.setState({ [key]: value });
      }
    }
  }
  /**
   * Save current state to sessionStorage.
   */
  saveStateToSessionStorage() {
    for (let key in this.state) {
      if (!keysToIgnore.includes(key)) {
        sessionStorage.setItem(key, JSON.stringify(this.state[key]));
      }
    }
  }

  componentDidMount() {
     // this.hydrateState();

     window.addEventListener(
       'beforeunload',
       this.saveStateToSessionStorage.bind(this)
     );
  }

  componentWillUnmount() {
    window.removeEventListener(
      'beforeunload',
      this.saveStateToSessionStorage.bind(this)
    );

    this.saveStateToSessionStorage();
  }


  /**
   * Accepts a boolean to determine if all todos should be marked complete or not.
   * @param  {Boolean} isToggleOn Boolean
   * @return {[type]}             Todos will be marked/unmarked completed
   */
  handleToggleAll = (isToggleAllOn) => {
    this.setState(prevState => {
      const todosMapCopy = new Map(prevState.todos);
      todosMapCopy.forEach((todoObj) => todoObj.completed = isToggleAllOn)

      return {
        todos: todosMapCopy
      }
    });
  }

  /**
   * Validate todo input field and create todo if valid.
   * @param  {[type]} e keydown event
   */
  _handleKeyDown = (e) => {
    if (e.key === 'Enter' && this.state.inputValue.length > 0) {
      this.createTodo();
      this.setState({inputValue: ''});
    }
  }

  _updateInputValue = (e) => {
    this.setState({inputValue: e.target.value});
  }

  /**
   * Get an array of todoIDs of completed todos.
   * @param  {[inputArr]} todosMap todosMap to convert to array and reduce
   * @return {[arr]}       Array of todoIDs of completed todos
   */
  getCompleted(todosMap) {
    const completedTodos = [...todosMap.entries()].reduce((arr, currTodo) => {
      let todoId = currTodo[0];
      let todoObj = currTodo[1];
      return todoObj.completed ? [...arr, todoId] : arr;
    }, []);
    return completedTodos;
  }

  /**
   * Generate random ID for Todo object.
   * @return {[str]} String of alphanumeric characters
   */
  _generateID() {
    return Math.random().toString(36).substring(2);
  }

  // TODO: KM - Add method to verify if ID is unique and not already in use.
  _verifyIdIsUnique(map, id) {
    return map.get(id) ? false : true;
  }

  /**
   * Create a new todo.
   */
  createTodo() {
    this.setState(prevState => {
      const todosMapCopy = new Map(prevState.todos);

      let todoID = this._generateID();
      todosMapCopy.set(todoID, {
        todo: this.state.inputValue,
        completed: false,
        editing: false
      })

      return {
        todos: todosMapCopy
      }
    });
  }

  /**
   * Delete a todo.
   * @param  {[str]} id ID of todo to remove from todos
   */
  deleteTodo = (id) => {
    this.setState(prevState => {
      const todosCopy = new Map(prevState.todos);
      todosCopy.delete(id);

      return {
        todos: todosCopy
      }
    });
  }

  /**
   * Update a todo's completed state.
   * @param  {[type]} e     Check/uncheck checkbox event
   * @param  {[type]} id    ID of checked todo
   */
  handleCheckBoxChange = (e, id) => {
    const isTargetChecked = e.target.checked;
    this.setState(prevState => {
      const newTodos = new Map(prevState.todos);
      newTodos.get(id).completed = isTargetChecked;

      return {
        todos: newTodos
      }
    });
  }

  /**
   * Batch delete completed todos.
   * @return {[type]} todos state with remaining incomplete todos
   */
  clearCompleted = () => {
    this.setState(prevState => {
      const todosMapCopy = new Map(prevState.todos);
      const todosToRemove = this.getCompleted(todosMapCopy);
      todosToRemove.forEach((todoId) => {
        todosMapCopy.delete(todoId);
      });

      return {
        todos: todosMapCopy
      }
    });
  }

  _handleFilterSelection = (e) => {
    const selectedFilter = e.target.dataset.filter;
    this.setState({nowShowing: selectedFilter});
  }

  /**
   * Create array with todo IDs to reflect the selected filter.
   * 'all' -> array of all todo IDs
   * 'active' -> array of todo IDs that are not marked completed
   * 'completed' -> array of todo IDs that are marked completed
   * @return {[arr]} Array of todo IDs
   */
  changeTodosView() {
    const copyTodosMap = new Map(this.state.todos);
    const copyTodosIds = [...copyTodosMap.keys()];

    switch(this.state.nowShowing) {
      case 'all':
        return copyTodosIds;
      case 'active':
        const activeTodosIds = copyTodosIds.filter(id =>
          copyTodosMap.get(id).completed === false
        );
        return activeTodosIds;
      case 'completed':
        const completedTodosIds = copyTodosIds.filter(id =>
          copyTodosMap.get(id).completed === true
        );
        return completedTodosIds;
      default:
        return copyTodosIds;
    }
  }

  /**
   * Set editing state to true when the user double clicks on a todo item.
   * Immediately set the cursor to the end of the input edit field.
   * @param  {[e]}  e  doubleclick event
   * @param  {[str]}  id todo ID
   */
  isEditMode = (e, id) => {
    this.setState(prevState => {
      const todosMapCopy = new Map(prevState.todos);
      todosMapCopy.get(id).editing = true;

      return {
        todos: todosMapCopy
      }
    }, () => document.getElementById(id).focus()); // Move cursor to the end of input field when field is visible
  }

  _handleInputEditValue = (e, id) => {
    const inputValue = e.target.value;
    this.setState(prevState => {
      const todosMapCopy = new Map(prevState.todos);
      todosMapCopy.get(id).todo = inputValue;

      return {
        todos: todosMapCopy
      }
    })
  }

  /**
   * Submit edited todo on 'enter' key down event and set edit mode to false to close
   * the input field view.
   * @param  {[e]} e  key down event
   * @param  {[str]} id todo ID
   */
  _handleKeyDownInputEdit = (e, id) => {
    if (e.key === 'Enter') {
      this.setState(prevState => {
        const todosMapCopy = new Map(prevState.todos);
        todosMapCopy.get(id).editing = false;

        return {
          todos: todosMapCopy
        }
      });
    }
  }

  /**
   * User can submit an edited todo by unfocusing on the input edit field
   * or a user can close the input edit field by unfocusing the todo item. Set
   * edit mode to false to close the input field view.
   * @param  {[type]} e  [description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  _handleBlurInputEdit = (e, id) => {
    this.setState(prevState => {
      const todosMapCopy = new Map(prevState.todos);
      todosMapCopy.get(id).editing = false;

      return {
        todos: todosMapCopy
      }
    });
  }

  render() {
    const todosMap = this.state.todos;
    const todosIds = this.changeTodosView();
    const numCompletedTodos = this.getCompleted(this.state.todos).length;
    const numIncompleteTodos = todosMap.size - numCompletedTodos;
    const numIncompleteTodosStr = numIncompleteTodos === 1 ? `${numIncompleteTodos} item left` : `${numIncompleteTodos} items left`;
    const filterSelected = (filter) => {
      return this.state.nowShowing === filter ? 'filter selected' : 'filter'
    }

    return (
      <div className="app">
        <header>todos</header>
        <div className="todos-wrapper">
        <div className="todos-container">
          {/* INPUT FIELD FOR TODO CREATION */}
          <div className="wrapper-input-field">
            <Toggle
              onClick={this.handleToggleAll}
              totalTodos={todosMap.size}
              totalCompletedTodos={numCompletedTodos}
            />
            <input
              className="input-field"
              type="text"
              placeholder="What needs to be done?"
              value={this.state.inputValue}
              onKeyDown={this._handleKeyDown}
              onChange={this._updateInputValue} />
          </div>

          {/* TODOS LIST */}
          {todosMap.size > 0 && (
            <div className="todos-list">
              <ul>
                {todosIds.map((id) => {
                  return(
                    <li key={id}>
                      <div className={
                        `todo ${todosMap.get(id).completed ? 'completed' : ''} ${todosMap.get(id).editing ? 'edit-on' : 'edit-off'}`}>
                        <div className="todo-checkbox-wrapper">
                          <input
                            className="checkbox"
                            type="checkbox"
                            checked={todosMap.get(id).completed}
                            onChange={(e) => this.handleCheckBoxChange(e, id)} />
                        </div>
                        <label
                          className="todo-name"
                          onDoubleClick={(e) => this.isEditMode(e, id)}>
                          {todosMap.get(id).todo}
                        </label>
                        <input
                          className="edit-field"
                          type="text"
                          id={id}
                          value={todosMap.get(id).todo}
                          onChange={(e) => this._handleInputEditValue(e, id)}
                          onKeyPress={(e) => this._handleKeyDownInputEdit(e, id)}
                          onBlur={(e) => this._handleBlurInputEdit(e, id)}
                        />
                        <div className="remove" onClick={() => this.deleteTodo(id)}>x</div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {/* FOOTER */}
              <div className="footer">
                <span className="count">{numIncompleteTodosStr}</span>
                <div className="filters-wrapper">
                  <ul className="filters">
                    <li
                      className={filterSelected('all')}
                      data-filter="all"
                      onClick={this._handleFilterSelection}>All</li>
                    <li
                      className={filterSelected('active')}
                      data-filter="active"
                      onClick={this._handleFilterSelection}>Active</li>
                    <li
                      className={filterSelected('completed')}
                      data-filter="completed"
                      onClick={this._handleFilterSelection}>Completed</li>
                  </ul>
                </div>
                  <button onClick={this.clearCompleted} className={numCompletedTodos > 0 ? 'clear-completed visible' : 'clear-completed hidden'}>Clear completed</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  }
}

export default App;
