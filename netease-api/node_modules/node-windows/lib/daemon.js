/**
 * @class nodewindows.Service
 * This utility can be used to manage node.js scripts as Windows services.
 *
 * **Please note that like all Windows services, creating one requires administrative privileges**.
 *
 * To create a service with node-windows, prepare a script like:
 *
 *      var Service = require('node-windows').Service;
 *
 *      // Create a new service object
 *      var svc = new Service({
 *        name:'Hello World',
 *        description: 'The nodejs.org example web server.',
 *        script: 'C:\\path\\to\\helloworld.js')
 *      });
 *
 *      // Listen for the "install" event, which indicates the
 *      // process is available as a service.
 *      svc.on('install',function(){
 *        svc.start();
 *      });
 *
 *      svc.install();
 *
 * The code above creates a new `Service` object, providing a pretty name and description.
 * The `script` attribute identifies the Node.js script that should run as a service. Upon running
 * this, the script will be visible from the Windows Services utility.
 *
 * ![Windows Service](https://raw.github.com/coreybutler/node-windows/master/docs/service.png)
 */
var exec = require('child_process').exec,
  path = require('path'),
  fs = require('fs'),
  PermError = 'Permission Denied. Requires administrative privileges.',
  wincmd = require('./binaries'),
  Logger = require('./eventlog'),
  daemonDir = 'daemon',
  wrapper = path.resolve(path.join(__dirname, './wrapper.js'));

// BEGIN SUPER AWFUL HACK TO GET AROUND WINSW.EXE ISSUE! REPLACE ASAP!!!!
// winsw.exe immediately responds with nothing, indicating success, even though
// it continues processing with the "install" method.
var sleep = function (period) {
  var st = new Date().getTime();
  while (new Date().getTime() <= st + (period * 1000)) { }
  return;
};

// The daemon class
var daemon = function (config) {

  /**
   * @cfg {Array|Object} [env]
   * An optional array or object used to pass environment variables to the node.js script.
   * You can do this by setting environment variables in the service config, as shown below:
   *
   *     var svc = new Service({
   *      name:'Hello World',
   *      description: 'The nodejs.org example web server.',
   *      script: 'C:\\path\\to\\helloworld.js',
   *      env: {
   *        name: "NODE_ENV",
   *        value: "production"
   *      }
   *     });
   *
   * You can also supply an array to set multiple environment variables:
   *
   *     var svc = new Service({
   *      name:'Hello World',
   *      description: 'The nodejs.org example web server.',
   *      script: 'C:\\path\\to\\helloworld.js',
   *      env: [{
   *        name: "HOME",
   *        value: process.env["USERPROFILE"] // Access the user home directory
   *      },{
   *        name: "NODE_ENV",
   *        value: "production"
   *      }]
   *     });
   */
  Object.defineProperties(this, {
    _name: {
      enumerable: false,
      writable: true,
      configurable: false,
      value: config.name || null
    },

    _eventlog: {
      enumerable: false,
      writable: true,
      configurable: false,
      value: null
    },

    _xml: {
      enumerable: false,
      get: function () {
        var wrapperArgs = [
          '--file', this.script,
          '--scriptoptions=' + this.scriptOptions,
          '--log', this.name + ' ' + 'wrapper',
          '--grow', this.grow,
          '--wait', this.wait,
          '--maxrestarts', this.maxRestarts,
          '--abortonerror', (this.abortOnError == true ? 'y' : 'n'),
          '--stopparentfirst', this.stopparentfirst
        ];

        if (this.maxRetries !== null) {
          wrapperArgs.push('--maxretries');
          wrapperArgs.push(this.maxRetries);
        }

        return require('./winsw').generateXml({
          name: this.name,
          id: this._exe,
          nodeOptions: this.nodeOptions,
          script: wrapper,
          scriptOptions: this.scriptOptions,
          wrapperArgs: wrapperArgs,
          description: this.description,
          logpath: this.logpath,
          env: config.env,
          execPath: this.execPath,
          logOnAs: this.logOnAs,
          workingdirectory: this.workingdirectory,
          stopparentfirst: this.stopparentfirst,
          stoptimeout: this.stoptimeout,
          logmode: this.logmode,
          logging: config.logging,
          allowServiceLogon: config.allowServiceLogon
        });
      }
    },

    _exe: {
      enumerable: false,
      get: function () {
        return this.id + '.exe';
      }
    },

    /**
     * @cfg {Number} [maxRetries=null]
     * The maximum number of restart attempts to make before the service is considered non-responsive/faulty.
     * Ignored by default.
     */
    maxRetries: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.hasOwnProperty('maxRetries') ? config.maxRetries : null
    },

    /**
     * @cfg {Boolean} [stopparentfirst=false]
     * Allow the service to shutdown cleanly.
     */
    stopparentfirst: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.stopparentfirst
    },

    /**
     * @cfg {Number} [stoptimeout=30]
     * How long to wait in seconds before force killing the application.
     * This only takes effect when stopparentfirst is enabled.
     */
    stoptimeout: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.hasOwnProperty('stoptimeout') ? config.stoptimeout : 30
    },

    /**
     * @cfg {string} [nodeOptions='--harmony']
     * Options to be passed to the node process.
     */
    nodeOptions: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.nodeOptions || '--harmony'
    },

    /**
    * @cfg {string} [scriptOptions='']
    * Options to be passed to the script.
    */
    scriptOptions: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.scriptOptions || ''
    },

    /**
     * @cfg {Number} [maxRestarts=3]
     * The maximum number of restarts within a 60 second period before haulting the process.
     * This cannot be _disabled_, but it can be rendered ineffective by setting a value of `0`.
     */
    maxRestarts: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.hasOwnProperty('maxRestarts') ? config.maxRestarts : 3
    },

    /**
     * @cfg {Boolean} [abortOnError=false]
     * Setting this to `true` will force the process to exit if it encounters an error that stops the node.js script from running.
     * This does not mean the process will stop if the script throws an error. It will only abort if the
     * script throws an error causing the process to exit (i.e. `process.exit(1)`).
     */
    abortOnError: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.abortOnError instanceof Boolean ? config.abortOnError : false
    },

    /**
     * @cfg {Number} [wait=1]
     * The initial number of seconds to wait before attempting a restart (after the script stops).
     */
    wait: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: !isNaN(config.wait) ? config.wait : 1
    },

    /**
     * @cfg {Number} [grow=.25]
     * A number between 0-1 representing the percentage growth rate for the #wait interval.
     * Setting this to anything other than `0` allows the process to increase it's wait period
     * on every restart attempt. If a process dies fatally, this will prevent the server from
     * restarting the process too rapidly (and too strenuously).
     */
    grow: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: !isNaN(config.grow) ? config.grow : .25
    },

    _directory: {
      enumerable: false,
      writable: true,
      configurable: false,
      value: config.script !== null ? path.dirname(config.script) : null
    },

    /**
     * Resolves the directory where the script is saved.
     */
    directory: {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (dir) {
        if (this.script == null || this.name == null) {
          throw Error('Script and Name are required but were not provided.');
        }
        if (dir) {
          this._directory = path.resolve(dir);
        }
        return path.resolve(path.join(this._directory, daemonDir));
      }
    },

    /**
     * @property {String} root
     * The root directory where the process files are stored.
     */
    root: {
      enumerable: true,
      get: function () { return this.directory(); }
    },

    // Generates the primary logging utility
    log: {
      enumerable: false,
      get: function () {
        if (this._eventlog !== null)
          return this._eventlog;
        if (this.name == null)
          throw 'No name was specified for the service';
        this._eventlog = new Logger(this.name + ' Monitor');
        return this._eventlog;
      }
    },

    // The path where log files should be stored
    logpath: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.logpath || null
    },

    // The log mode. Options are the same as winsw#generateXml
    logmode: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.logmode || 'rotate'
    },

    // The name of the process
    name: {
      enumerable: false,
      get: function () { return this._name; },
      set: function (value) { this._name = value; }
    },

    // The ID for the process
    id: {
      enumerable: true,
      get: function () {
        return this.name.replace(/[^\w]/gi, '').toLowerCase();
      }
    },

    // Description of the service
    description: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: config.description || ''
    },

    /**
     * @property {Object} [user]
     * If you need to specify a specific user or particular credentials to manage a service, the following
     * attributes may be helpful.
     *
     * The `user` attribute is an object with three keys: `domain`,`account`, and `password`.
     * This can be used to identify which user the service library should use to perform system commands.
     * By default, the domain is set to the local computer name, but it can be overridden with an Active Directory
     * or LDAP domain. For example:
     *
     * **app.js**
     *
     *     var Service = require('node-windows').Service;
     *
     *     // Create a new service object
     *     var svc = new Service({
     *       name:'Hello World',
     *       script: require('path').join(__dirname,'helloworld.js')
     *     });
     *
     *     svc.user.domain = 'mydomain.local';
     *     svc.user.account = 'username';
     *     svc.user.password = 'password';
     *     ...
     *
     * Both the account and password must be explicitly defined if you want the service module to
     * run commands as a specific user. By default, it will run using the user account that launched
     * the process (i.e. who launched `node app.js`).
     */
    user: {
      enumerable: false,
      writable: true,
      configurable: false,
      value: {
        account: null,
        password: null,
        domain: process.env.COMPUTERNAME
      }
    },
    /**
     * @property {Object} [logOnAs]
     * If you need to specify a specific user or particular credentials for the service log on as once installed, the following
     * attributes may be helpful.
     *
     * The `logOnAs` attribute is an object with four keys: `domain`,`account`, `password`, and `mungeCredentialsAfterInstall`.
     * This can be used to identify which user the service should run as once installed.
     *
     * If no account and password is specified, the logOnAs property is not used and the service will run as the "Local System" account.
     * If account and password is specified, but domain is not specified then the domain is set to the local computer name, but it can be overridden with an Active Directory
     * or LDAP domain. For example:
     *
     * **app.js**
     *
     *     var Service = require('node-windows').Service;
     *
     *     // Create a new service object
     *     var svc = new Service({
     *       name:'Hello World',
     *       script: require('path').join(__dirname,'helloworld.js')
     *     });
     *
     *     svc.logOnAs.domain = 'mydomain.local';
     *     svc.logOnAs.account = 'username';
     *     svc.logOnAs.password = 'password';
     *     ...
     *
     * Both the account and password must be explicitly defined if you want the service to log on as that user,
     * otherwise the Local System account will be used.
     */
    logOnAs: {
      enumerable: false,
      writable: true,
      configurable: false,
      value: {
        account: null,
        password: null,
        domain: process.env.COMPUTERNAME,
        mungeCredentialsAfterInstall: true
      }
    },

    /**
     * @property {String} [workingdirectory]
     * The full path to the working directory that the service process
     * should launch from. If this is omitted, it will default to the
     * current processes working directory.
     */
    workingdirectory: {
      enumerable: false,
      writable: true,
      configurable: false,
      value: config.hasOwnProperty('workingDirectory') ? config.workingDirectory : process.cwd()
    },

    // Optionally provide a sudo password.
    sudo: {
      enumerable: false,
      writable: true,
      configurable: false,
      value: {
        password: null
      }
    },

    /**
     * @cfg {String} script
     * The absolute path of the script to launch as a service.
     * @required
     */
    script: {
      enumerable: true,
      writable: true,
      configurable: false,
      value: config.script !== undefined ? require('path').resolve(config.script) : null
    },

    /**
     * @cfg {String} execPath
     * The absolute path to the executable that will launch the script.
     * If omitted process.execPath is used.
     */
    execPath: {
      enumerable: true,
      writable: true,
      configurable: false,
      value: config.execPath !== undefined ? require('path').resolve(config.execPath) : null
    },

    /**
     * @method install
     * Install the script as a process.
     * @param {String} [dir=root of script]
     * The directory where the process files will be saved. Defaults to #script path.
     * @param {Function} [callback]
     * The callback to fire when the installation completes.
     */
    /**
     * @event install
     * Fired when the installation process is complete.
     */
    /**
     * @event alreadyinstalled
     * Fired if the script is already known to be a service.
     */
    /**
     * @event invalidinstallation
     * Fired if an installation is detected but missing required files.
     */
    /**
     * @event error
     * Fired in some instances when an error occurs.
     */
    install: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (dir) {
        if (this.script == null || this.name == null) {
          throw Error('Script and Name are required but were not provided.');
        }

        if (this.exists) {
          var missing = false;
          if (!fs.existsSync(path.join(this.root, this._exe))) {
            this.log.warn('The main executable is missing or cannot be found (' + path.join(this.root, this._exe) + ')');
            missing = true;
          }
          if (!fs.existsSync(path.join(this.root, this.id + '.xml'))) {
            this.log.warn('The primary configuration file is missing or cannot be found (' + path.join(this.root, this.id + '.xml') + ')');
            missing = true;
          }
          if (missing.length > 0) {
            this.emit('invalidinstallation');
            return;
          }
          this.log.warn('The process cannot be installed again because it already exists.');
          this.emit('alreadyinstalled');
          return;
        }

        var winsw = require('./winsw'), me = this;

        if (typeof dir === 'function') {
          callback = dir;
          dir = null;
        }
        dir = this.directory(dir);

        // If the output directory does not exist, create it.
        fs.exists(dir, function (exists) {
          if (!exists) {
            fs.mkdirSync(dir);
          }
          // Write the configuration file
          fs.writeFile(path.resolve(dir, me.id + '.xml'), me._xml, function () {
            // Write the exe file
            winsw.createExe(me.id, dir, function () {
              me.execute('"' + path.resolve(dir, me._exe) + '" install', function () {
                sleep(2);
                me.emit('install');
              });
            });
          });
        });
      }
    },

    /**
     * @method uninstall
     * Uninstall the service.
     * @param {Number} [waitTime]
     * Seconds to wait until winsw.exe finish processing the uninstall command.
     *
     *      var Service = require('node-windows').Service;
     *
     *      // Create a new service object
     *      var svc = new Service({
     *        name:'Hello World',
     *        script: require('path').join(__dirname,'helloworld.js')
     *      });
     *
     *      // Listen for the "uninstall" event so we know when it's done.
     *      svc.on('uninstall',function(){
     *        console.log('Uninstall complete.');
     *        console.log('The service exists: ',svc.exists);
     *      });
     *
     *      // Uninstall the service.
     *      svc.uninstall();
     */
    /**
     * @event uninstall
     * Fired when the uninstall is complete.
     */
    /**
     * @event alreadyuninstalled
     * Fired if the script is unknown as a service.
     */
    uninstall: {
      enumerable: true,
      writable: false,
      value: function (waitTime) {
        var me = this;
        waitTime = waitTime || 2; // The same wait time as in the install method

        if (!this.exists) {
          console.log('Uninstall was skipped because process does not exist or could not be found.');
          this.emit('alreadyuninstalled');
          return;
        }

        var uninstaller = function () {
          // Uninstall the process
          me.execute('"' + path.resolve(me.root, me._exe) + '" uninstall', function (error, stdout, stderr) {
            if (error) {
              me.checkPermError(error);
            } else if (stderr.trim().length > 0) {
              console.log('Error: ', stderr);
            } else {
              sleep(waitTime); // Wait for uninstall to fully finish

              var rm = function (file) {
                if (fs.existsSync(path.join(me.root, file))) {
                  fs.unlinkSync(path.join(me.root, file));
                }
              };

              // Remove the daemon files individually to prevent security warnings.
              rm(me.id + '.xml');

              // Remove known wrappers
              rm(me.id + '.wrapper.log');
              rm(me.id + '.out.log');
              rm(me.id + '.err.log');

              // Remove the executable and executable .NET runtime config file
              rm(me.id + '.exe');
              rm(me.id + '.exe.config');

              // Remove all other files
              var _other_files = fs.readdirSync(me.root).filter(function (file) {
                const regex = /^.+\.((wrapper|out|err)\.log)|(exe|xml)$/g
                return !regex.exec(file)
              })
              _other_files.forEach(function (f) {
                rm(f)
              });

              // Remove the dir iff it's empty
              if (fs.readdirSync(me.root).length === 0) {
                if (me.root !== path.dirname(me.script)) {
                  fs.rmdir(me.root, function () {
                    sleep(1);
                    me.emit('uninstall');
                  });
                } else {
                  me.emit('uninstall');
                }
              }
              else {
                me.emit('uninstall');
              }
            }
          });
        };

        this.once('stop', uninstaller);
        this.once('alreadystopped', uninstaller);
        this.stop();
      }
    },

    /**
     * @method start
     * Start an existing method.
     */
    /**
     * @event start
     * Fired when the event has started.
     */
    start: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        var me = this;

        if (this.name == null) {
          throw "A name for the service is required.";
        }

        if (!this.exists) {
          throw Error('The service "' + this.name + '" does not exist or could not be found.');
        }

        this.execute('NET START "' + me._exe + '"', function (err, stdout, stderr) {
          if (err) {
            if (err.code == 2) {
              if (err.message.indexOf('already been started') >= 0 && err.message.indexOf('service name is invalid') < 0) {
                me.log.warn('An attempt to start the service failed because the service is already running. The process should be stopped before starting, or the restart method should be used.');
                me.emit('error', err);
                return;
              } else if (err.message.indexOf('service name is invalid') < 0) {
                me.checkPermError(err);
                console.log(err);
                me.emit('error', err);
                return;
              }
            } else {
              me.log.error(err.toString());
            }
          } else {
            me.emit('start');
          }
        })
      }
    },

    /**
     * @method stop
     * Stop the service.
     */
    /**
     * @event stop
     * Fired when the service is stopped.
     */
    stop: {
      enumerable: true,
      writable: false,
      value: function () {
        var me = this;

        me.execute('NET STOP "' + me._exe + '"', function (err, stdout, stderr) {
          if (err) {
            if (err.code == 2) {
              me.log.warn('An attempt to stop the service failed because the service is/was not running.');
              me.emit('alreadystopped');
            } else {
              me.checkPermError(err);
            }
          } else {
            me.log.info(stdout);
            //sleep(10); // Wait for stop to complete.
            me.emit('stop');
          }
        });
      }
    },

    /**
     * @method restart
     * Restart an existing service
     */
    restart: {
      enumerable: true,
      writable: false,
      value: function (callback) {
        var me = this;
        this.once('stop', me.start);
        this.stop();
      }
    },

    /**
     * @property {Boolean} exists
     * Determine whether the service exists.
     */
    exists: {
      enumerable: true,
      get: function () {
        if (this.script == null || this.name == null) {
          throw Error('Script and name are required but were not specified.');
        }
        return fs.existsSync(path.join(this.directory(), this.id + '.exe')) && fs.existsSync(path.join(this.directory(), this.id + '.xml'));
      }
    },

    // Execute commands with elevated privileges.
    execute: {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (cmd, options, callback) {
        var me = this;
        callback = callback || function () { };
        options = options || {};

        wincmd.isAdminUser(function (isAdmin) {
          if (isAdmin) {
            if (typeof options === 'function') {
              callback = options;
              options = {};
            }
            if (me.user.account !== null && me.user.password !== null) {
              _cmd = "runas /profile /user:" + me.user.domain + "\\" + me.user.account + " " + cmd;
              exec(cmd, options, callback);
            } else if (me.sudo.password !== null) {
              // If the user is not an admin, but a sudo password is provided for admin,
              // attempt to launch using sudo.
              wincmd.sudo(cmd, me.sudo.password || '', options, callback);
            } else {
              wincmd.elevate(cmd, options, callback)
            }
          } else {
            console.log(PermError);
            throw PermError;
          }
        });
      }
    },

    // Check for permission errors
    checkPermError: {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (error) {
        if (error.message.indexOf('Administrator access') >= 0 || error.message.indexOf('Access is denied') >= 0) {
          try { this.log.error(PermError); } catch (e) { console.log(PermError); }
        } else {
          try { this.log.error(error.toString()); } catch (e) { console.log(error.toString()); }
        }
        process.exit(1);
      }
    }
  });
};

var util = require('util'),
  EventEmitter = require('events').EventEmitter;

// Inherit Events
util.inherits(daemon, EventEmitter);

// Export functionality for the module.
module.exports = daemon;