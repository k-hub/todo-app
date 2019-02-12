import React, { Component } from 'react';
import './App.css';

const keysToIgnore = ['inputValue'];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleAll: false,
      todos: [],
      inputValue: '',
      nowShowing: 'all',
    };
  }

  /**
   * Load previous saved state in sessionStorage
   */
  // hydrateState() {
  //   for (let key in this.state) {
  //     if (sessionStorage.hasOwnProperty(key)) {
  //       let value = sessionStorage.getItem(key) || this.state[key];
  //       value = JSON.parse(value);
  //       this.setState({[key]: value});
  //     }
  //   }
  // }
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
   * Save current state to sessionStorage
   */
  // saveStateToSessionStorage() {
  //   for (let key in this.state) {
  //     if (!keysToIgnore.includes(key)) {
  //       sessionStorage.setItem(key, JSON.stringify(this.state[key]))
  //     }
  //   }
  // }
  //
  saveStateToSessionStorage() {
    for (let key in this.state) {
      if (!keysToIgnore.includes(key)) {
        sessionStorage.setItem(key, JSON.stringify(this.state[key]));
      }
    }
  }

  componentDidMount() {
     // this.hydrateState(); // TODO: UNCOMMENT THIS WHEN COMPLETE

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
   * Toggle to select/de-select all todos
   */
  _handleToggleAll = () => {
    this.setState(prevState => {
      const newTodos = [...prevState.todos];
      // toggleAll state is required because each todo can be toggled in different places:
      //   toggleAll control, individual todo checkbox, create todo, delete todo, batch delete todo
      newTodos.forEach((todo) => todo.completed = !prevState.toggleAll)

      return {
        toggleAll: !prevState.toggleAll,
        todos: newTodos
      }
    });
  }

  /**
   * Check key down for specific key to //TODO: FINISH THIS DESCRIPTION
   * @param  {[type]} e input key event
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
   * Get an array of indices of completed todos
   * @param  {[inputArr]} todos InputArray to reduce
   * @return {[arr]}       Array of incides of completed todos
   */
  getCompleted(todos) {
    const completedTodos = todos.reduce((arr, currTodo, index) => {
      return currTodo.completed ? [...arr, index] : arr;
    }, []);
    return completedTodos;
  }

  /**
   * Create a new todo and invoke updateToggleAllState callback
   */
  createTodo() {
    this.setState(prevState => {
      return {
        todos: [...this.state.todos, {todo: this.state.inputValue, completed: false}]
      }
    }, () => this.updateToggleAllState(this.state.todos));
  }

  /**
   * Delete a todo and invoke updateToggleAllState callback
   * @param  {[type]} index Index of todo to remove from todos
   */
  deleteTodo = (index) => {
    // TODO: FIX THIS METHOD BECAUSE INDEXING WILL CAUSE ISSUES IN THE FILTERED VIEWS
    // have checks on which filter we are currently on to determine which delete approach to use
    //    - current approach for all
    //    - do a lookup of id index and splice
    this.setState(prevState => {
      const todosCopy = [...prevState.todos];
      todosCopy.splice(index, 1);

      return {
        todos: todosCopy
      }
    }, () => this.updateToggleAllState(this.state.todos));
  }

  /**
   * Update a todo's completed state and invoke updateToggleAllState callback
   * @param  {[type]} e     Check/uncheck checkbox
   * @param  {[type]} index Index of item checked
   */
  handleCheckBoxChange = (e, index) => {
    const isTargetChecked = e.target.checked;
    this.setState(prevState => {
      const newTodos = [...prevState.todos];
      newTodos[index].completed = isTargetChecked;

      return {
        todos: newTodos
      }
    }, () => this.updateToggleAllState(this.state.todos));
  }

// TODO: FIX THIS METHOD BECAUSE INDEXING WILL CAUSE ISSUES IN THE FILTERED VIEWS
  /**
   * Batch delete completed todos and invoke updateToggleAllState callback
   * @return {[type]} todos state with remaining incomplete todos
   */
  clearCompleted = () => {
    this.setState(prevState => {
      const todosCopy = [...prevState.todos];
      // Reverse the array to avoid having to deal with reindexing when splicing
      const todosToRemove = this.getCompleted(todosCopy).reverse();
      todosToRemove.forEach((todoIndex) => {
        todosCopy.splice(todoIndex, 1);
      });

      return {
        todos: todosCopy
      }
    }, () => this.updateToggleAllState(this.state.todos));
  }

  /**
   * Updating toggleAll state is required during the following actions:
   *   - create a todo: Example case when a check is performed is when all todos are marked completed and
   *       a new todo is added -> toggleAll to false.
   *   - delete a todo: Example case when a check is performed is when the remaining todos are marked completed and
   *       deleted todo was incomplete -> toggleAll to true.
   *   - batch delete todos: Example case when a check is performed is when all todos are marked completed and
   *       then cleared -> toggleAll to false.
   *   - toggle individual todo: Example case when a check is performed is when there's one todo and it has been marked
   *       completed -> toggleAll to true.
   *
   * @param  {[type]} todos Array of current todos
   * @return {[type]}       toggleAll state is set to true or false
   */
  updateToggleAllState = (todos) => {
    const numCompletedTodos = this.getCompleted(todos).length;
    const totalTodos = todos.length;

    return numCompletedTodos === totalTodos && totalTodos > 0 ? this.setState({toggleAll: true}) : this.setState({toggleAll: false});
  }

  _handleFilterSelection = (e) => {
    const selectedFilter = e.target.dataset.filter;
    this.setState({nowShowing: selectedFilter });
  }

  changeTodosView() {
    const copyTodos = [...this.state.todos];
    const completedTodosIndices = this.getCompleted(this.state.todos);

    switch(this.state.nowShowing) {
      case 'all':
        return this.state.todos;
      case 'active':
        const activeTodos = copyTodos.filter((todo, index) => {
          return !completedTodosIndices.includes(index);
        });
        return activeTodos;
      case 'completed':
        const completedTodos = copyTodos.filter((todo, index) => {
          return completedTodosIndices.includes(index);
        });
        return completedTodos;
      default:
        return this.state.todos;
    }
  }

  render() {
    const todos = this.changeTodosView();
    const numCompletedTodos = this.getCompleted(this.state.todos).length;
    const numIncompleteTodos = this.state.todos.length - numCompletedTodos;
    const numIncompleteTodosStr = numIncompleteTodos === 1 ? `${numIncompleteTodos} item left` : `${numIncompleteTodos} items left`;
    const filterSelected = (filter) => {
      return this.state.nowShowing === filter ? 'filter selected' : 'filter'
    }

    return (
      <div className="App">
        <div className="todos-wrapper">
        <header>todos</header>
        <div className="todos-container">
          {/* INPUT FIELD */}
          <div className="wrapper-input-field">
            {this.state.todos.length > 0 && (
              <span className={this.state.toggleAll ? 'toggle-all-icon selected' : 'toggle-all-icon'} onClick={this._handleToggleAll}></span>
            )}
            <input
              className="input-field"
              type="text"
              placeholder="What needs to be done?"
              value={this.state.inputValue}
              onKeyDown={this._handleKeyDown}
              onChange={this._updateInputValue} />
          </div>

          {/* TODOS LIST */}
          {this.state.todos.length > 0 && (
            <div className="todos-list">
              <ul>
                {todos.map((todoObj, index) => {
                  return (
                    <li key={`${todoObj.todo}-${index}`} className={todoObj.completed ? 'completed' : ''}>
                      <div className="todo">
                        <input
                          className="checkbox"
                          type="checkbox"
                          id={`${todoObj.todo}-${index}`}
                          checked={todoObj.completed}
                          onChange={(e) => this.handleCheckBoxChange(e, index)} />
                        <label htmlFor={`${todoObj.todo}-${index}`}>{todoObj.todo}</label>
                        <div className="remove" onClick={() => this.deleteTodo(index)}>x</div>
                      </div>
                    </li>
                  )}
                )}
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
