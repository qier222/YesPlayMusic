module.exports = {

  /**
   * @method generateXml
   * Generate the XML for the winsw configuration file.
   * @param {Object} config
   * The config object must have the following attributes:
   *
   * - *id* This is is how the service is identified. Alphanumeric, no spaces.
   * - *name* The descriptive name of the service.
   * - *script* The absolute path of the node.js server script. i.e. in this case
   *  it's the wrapper script, not the user's server script.
   *
   * Optional attributes include
   *
   * - *description* The description that shows up in the service manager.
   * - *nodeOptions* Array or space separated string of node options (e.g. '--harmony')
   * - *wrapperArgs* additional arguments to pass to wrapper script to control restarts, etc.
   * - *logmode* Valid values include `rotate` (default), `reset` (clear log), `roll` (move to .old), and `append`.
   * - *logging* Supersedes *logmode*. Object of form `{mode: 'append'}`,
   * `{mode: 'reset'}`, `{mode: 'none'}`, `{mode: 'roll-by-time', pattern: 'yyyMMdd'}`,
   * or `{mode: 'roll-by-size', sizeThreshold: 10240, keepFiles: 8}` (all attributes optional,
   * example shows defaults). See [winsw docs](https://github.com/kohsuke/winsw/tree/winsw-1.17#logging).
   * - *logpath* The absolute path to the directory where logs should be stored. Defaults to the current directory.
   * - *dependencies* A comma delimited list or array of process dependencies.
   * - *env* A key/value object or array of key/value objects containing
   * environment variables to pass to the process. The object might look like `{name:'HOME',value:'c:\Windows'}`.
   * - *logOnAs* A key/value object that contains the service logon credentials.
   * The object might look like `{account:'user', password:'pwd', domain:'MYDOMAIN'}
   * If this is not included or does not have all 3 members set then it is not used.
   * - *workingdirectory* optional working directory that service should run in.
   * If this is not included, the current working directory of the install process
   * is used.
   */
  generateXml: function(config)
  {
    var xml;

    // add multiple "tag" items to the xml
    // if input is an array, add each element of the array, if it's a string,
    // split it around splitter and add each one
    // if input is null or undefined do nothing
    function multi(tag, input, splitter)
    {
      // do nothing if no input
      if (input===undefined || input===null) {
        return;
      }

      if (!(input instanceof Array)) {
        input = input.split(splitter||',');
      }
      input.forEach(function(val) {
        var ele={};
        ele[tag]=String(val).trim();
        xml.push(ele);
      });
    }

    // Make sure required configuration items are present
    if (!config || !config.id || !config.name || !config.script)
    {
      throw "WINSW must be configured with a minimum of id, name and script";
    }

    // create json template of xml
    // only the portion of the xml inside the top level 'service' tag
    xml = [
      {id: config.id},
      {name: config.name},
      {description: config.description||''},
      {executable: config.execPath || process.execPath}
    ];

    multi('argument',config.nodeOptions, ' ');
    xml.push({argument:config.script.trim()});
console.log({loc: 'winsw.js ~line 77', xml, config})
    multi('argument',config.wrapperArgs,' ');

    // Optionally add logging values, defaulting to logmode
    if (config.logging) {
      var logcontent = [{_attr: {mode: (config.logging.mode || 'append')}}];
      if (config.logging.mode === 'roll-by-time') {
        logcontent.push({pattern: (config.logging.pattern || 'yyyMMdd')});
      }
      if (config.logging.mode === 'roll-by-size') {
        logcontent.push({sizeThreshold: (config.logging.sizeThreshold || 10240)});
        logcontent.push({keepFiles: (config.logging.keepFiles || 8)});
      }
      xml.push({log: logcontent});
    }
    else {
      xml.push({logmode: config.logmode||'rotate'});
    }

    // Optionally add log path
    if (config.logpath) {
      xml.push({logpath : config.logpath});
    }

    // Optionally add stopparentprocessfirst
    if (config.stopparentfirst) {
      xml.push({stopparentprocessfirst: config.stopparentfirst});
    }

    // Optionally set the stoptimeout
    if (config.stoptimeout) {
      xml.push({stoptimeout: config.stoptimeout + 'sec'});
    }

    // Optionally add service dependencies
    multi('depend',config.dependencies);

    // Optionally add environment values
    if (config.env) {
      config.env = (config.env instanceof Array == true) ?
        config.env : [config.env];
      config.env.forEach(function(env){
        xml.push({env: {_attr: {name:env.name, value:env.value}}});
      });
    }

    // optionally set the service logon credentials
    if (config.logOnAs) {
      var serviceaccount = [
        { domain: config.logOnAs.domain || 'NT AUTHORITY' },
        { user: config.logOnAs.account || 'LocalSystem' },
        { password: config.logOnAs.password || '' }
      ]

      if (config.allowServiceLogon) {
        serviceaccount.push({ allowservicelogon: 'true' })
      }

      xml.push({
        serviceaccount: serviceaccount
      });
    }

    // if no working directory specified, use current working directory
    // that this process was launched with
    xml.push({workingdirectory: config.workingdirectory || process.cwd()});

    // indent resultant xml with tabs, and use windows newlines for extra readability
    return require('xml')({service:xml}, {indent: '\t'}).replace(/\n/g,'\r\n');
  },

  /**
   * Copy install version of winsw.exe to specific renamed version according to
   * the service id. Also copy .exe.config file that allows it to run under
   * .NET 4+ runtime on newer versions of windows.
   * (see https://github.com/kohsuke/winsw#net-runtime-40)
   *
   * @method createExe
   * Create the executable
   * @param {String} name
   * The alphanumeric string (spaces are stripped) of the `.exe` file. For example, `My App` generates `myapp.exe`
   * @param {String} [dir=cwd]
   * The output directory where the executable will be saved.
   * @param {Function} [callback]
   * The callback to fire upon completion.
   */
  createExe: function(name,dir,callback) {
    var fs = require('fs'), p = require('path');

    if (typeof dir === 'function') {
      callback = dir;
      dir = null;
    }

    dir = dir || process.cwd();

    var exeOrigin = p.join(__dirname,'..','bin','winsw','winsw.exe'),
        cfgOrigin = p.join(__dirname,'..','bin','winsw','winsw.exe.config'),
        exeDest = p.join(dir,name.replace(/[^\w]/gi,'').toLowerCase()+'.exe'),
        cfgDest = p.join(dir,name.replace(/[^\w]/gi,'').toLowerCase()+'.exe.config'),
        exeData = fs.readFileSync(exeOrigin,{encoding:'binary'}),
        cfgData = fs.readFileSync(cfgOrigin,{encoding:'binary'});

    fs.writeFileSync(exeDest,exeData,{encoding:'binary'});
    fs.writeFileSync(cfgDest,cfgData,{encoding:'binary'});
    callback && callback();
  }
}
