import React from 'react';
import MyComponent from './components/MyComponent';

const App: React.FC = () => {
  return (
    <div className="App">
      <MyComponent name="Madhav" age={21} />
    </div>
  );
};

export default App;
