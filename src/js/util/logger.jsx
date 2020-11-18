let Logger = class {
  moduleLog(module, message) {
    console.log(`%c[${module}]%c ${message}`, 
        'color: #2A53CD; font-weight: bold;',
        'color: #000000; font-weight: normal;');
  }
}

export default Logger;