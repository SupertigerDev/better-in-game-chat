
 /**
  * onMouseWheel
  * @type {(callback: (event: any) => void)) => void})}
  */
 const onMouseWheel = window.api.onMouseWheel;

 /**
  * onKeyUp
  * @type {(callback: (event: any) => void)) => void})}
  */
 const onKeyUp = window.api.onKeyUp;

 /**
  * onKeyDown
  * @type {(callback: (event: any) => void)) => void})}
  */
 const onKeyDown = window.api.onKeyDown;


/**
 * Focus 
 * @type {() => void})}
 */
const focusWindow = window.api.focusWindow;

/**
 * Blur
 * @type {()) => void})}
 */
const blurWindow = window.api.blurWindow;



/**
 * Focus Event
 * @type {(callback: () => void)) => void})}
 */
const onFocus = window.api.onFocus;

/**
 * Blur Event
 * @type {(callback: () => void)) => void})}
 */
const onBlur = window.api.onBlur;


/**
 * set IgnoreMouseEvents
 * @type {(ignore: boolean) => void})}
 */
const setIgnoreMouseEvents = window.api.setIgnoreMouseEvents;

/**
 * Set chat username
 * @type {(color: string) => void})}
 */
const setUsername = window.api.setUsername;


/**
 * Get chat username
 * @type {() => Promise<string | undefined>})}
 */
const getUsername = window.api.getUsername;



/**
 * Set chat color
 * @type {(color: string) => void})}
 */
const setColor = window.api.setColor;


/**
 * Get chat color
 * @type {() => Promise<string | undefined>})}
 */
const getColor = window.api.getColor;

/**
 * Set window position
 * @type {(pos: {x: number, y:number}) => void})}
 */
const setPos = window.api.setPos;



/**
 * Get Stored window position
 * @type {() => Promise<{x: number, y:number} | undefined>})}
 */
const getPos = window.api.getPos;

/**
 * Get current window position
 * @type {() => Promise<{x: number, y:number} | undefined>})}
 */
const getCurrentPos = window.api.getCurrentPos;


/**
 * Store key-binds
 * @type {(binds: string[]) => void})}
 */
const setKeyBind = window.api.setKeyBind;


/**
 * Get key-binds
 * @type {() => Promise<string[] | undefined>})}
 */
const getKeyBinds = window.api.getKeyBinds;



/**
 * Store the ip address of the server.
 * @type {(ip: string) => void})}
 */
const setIp = window.api.setIp;


/**
 * Get the ip address that is currently set.
 * @type {() => Promise<string | undefined>})}
 */
const getIp = window.api.getIp;


/**
 * Closes the program.
 * @type {() => void})}
 */
const exitOverlay = window.api.exitOverlay;



export {
  onMouseWheel,
  blurWindow,
  exitOverlay,
  focusWindow,
  getColor,
  getCurrentPos,
  getIp,
  getKeyBinds,
  getPos,
  getUsername,
  onBlur,
  onFocus,
  onKeyDown,
  onKeyUp,
  setColor,
  setIgnoreMouseEvents,
  setIp,
  setKeyBind,
  setPos,
  setUsername,
}