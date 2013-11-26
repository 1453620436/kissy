function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/io/xdr-flash-transport.js']) {
  _$jscoverage['/io/xdr-flash-transport.js'] = {};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData = [];
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[6] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[7] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[9] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[20] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[21] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[22] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[24] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[25] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[37] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[38] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[41] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[42] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[43] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[46] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[49] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[54] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[56] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[57] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[58] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[60] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[62] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[63] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[66] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[75] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[79] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[87] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[88] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[91] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[93] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[94] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[95] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[97] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[98] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[102] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[103] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[107] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[109] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[110] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[116] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[117] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[119] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[120] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[122] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[126] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[127] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[135] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[136] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[137] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[140] = 0;
}
if (! _$jscoverage['/io/xdr-flash-transport.js'].functionData) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData = [];
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[0] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[1] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[2] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[3] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[4] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[5] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[6] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[7] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[8] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[9] = 0;
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[10] = 0;
}
if (! _$jscoverage['/io/xdr-flash-transport.js'].branchData) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData = {};
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['21'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['37'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['52'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['54'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['56'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['70'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['70'][2] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['87'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['105'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['109'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['137'] = [];
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['137'][1] = new BranchData();
}
_$jscoverage['/io/xdr-flash-transport.js'].branchData['137'][1].init(40, 29, 'xhr && xhr._xdrResponse(e, o)');
function visit144_137_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['109'][1].init(1016, 3, 'ret');
function visit143_109_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['105'][1].init(101, 17, 'c.statusText || e');
function visit142_105_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['87'][1].init(254, 36, 'c && (responseText = c.responseText)');
function visit141_87_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['70'][2].init(118, 22, 'c.hasContent && c.data');
function visit140_70_2(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['70'][1].init(118, 28, 'c.hasContent && c.data || {}');
function visit139_70_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['56'][1].init(278, 6, '!flash');
function visit138_56_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['54'][1].init(182, 47, 'xdr.src || (S.Config.base + \'io/assets/io.swf\')');
function visit137_54_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['52'][1].init(99, 14, 'c[\'xdr\'] || {}');
function visit136_52_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['37'][1].init(616, 31, 'doc.body || doc.documentElement');
function visit135_37_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].branchData['21'][1].init(13, 4, 'init');
function visit134_21_1(result) {
  _$jscoverage['/io/xdr-flash-transport.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xdr-flash-transport.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[0]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[7]++;
  var IO = require('./base'), Dom = require('dom');
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[9]++;
  var maps = {}, logger = S.getLogger('s/io'), ID = 'io_swf', flash, doc = S.Env.host.document, init = false;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[20]++;
  function _swf(uri, _, uid) {
    _$jscoverage['/io/xdr-flash-transport.js'].functionData[1]++;
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[21]++;
    if (visit134_21_1(init)) {
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[22]++;
      return;
    }
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[24]++;
    init = true;
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[25]++;
    var o = '<object id="' + ID + '" type="application/x-shockwave-flash" data="' + uri + '" width="0" height="0">' + '<param name="movie" value="' + uri + '" />' + '<param name="FlashVars" value="yid=' + _ + '&uid=' + uid + '&host=KISSY.IO" />' + '<param name="allowScriptAccess" value="always" />' + '</object>', c = doc.createElement('div');
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[37]++;
    Dom.prepend(c, visit135_37_1(doc.body || doc.documentElement));
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[38]++;
    c.innerHTML = o;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[41]++;
  function XdrFlashTransport(io) {
    _$jscoverage['/io/xdr-flash-transport.js'].functionData[2]++;
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[42]++;
    logger.info('use XdrFlashTransport for: ' + io.config.url);
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[43]++;
    this.io = io;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[46]++;
  S.augment(XdrFlashTransport, {
  send: function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[3]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[49]++;
  var self = this, io = self.io, c = io.config, xdr = visit136_52_1(c['xdr'] || {});
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[54]++;
  _swf(visit137_54_1(xdr.src || (S.Config.base + 'io/assets/io.swf')), 1, 1);
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[56]++;
  if (visit138_56_1(!flash)) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[57]++;
    setTimeout(function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[4]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[58]++;
  self.send();
}, 200);
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[60]++;
    return;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[62]++;
  self._uid = S.guid();
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[63]++;
  maps[self._uid] = self;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[66]++;
  flash.send(io._getUrlForSend(), {
  id: self._uid, 
  uid: self._uid, 
  method: c.type, 
  data: visit139_70_1(visit140_70_2(c.hasContent && c.data) || {})});
}, 
  abort: function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[5]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[75]++;
  flash.abort(this._uid);
}, 
  _xdrResponse: function(e, o) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[6]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[79]++;
  var self = this, ret, id = o.id, responseText, c = o.c, io = self.io;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[87]++;
  if (visit141_87_1(c && (responseText = c.responseText))) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[88]++;
    io.responseText = decodeURI(responseText);
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[91]++;
  switch (e) {
    case 'success':
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[93]++;
      ret = {
  status: 200, 
  statusText: 'success'};
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[94]++;
      delete maps[id];
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[95]++;
      break;
    case 'abort':
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[97]++;
      delete maps[id];
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[98]++;
      break;
    case 'timeout':
    case 'transport error':
    case 'failure':
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[102]++;
      delete maps[id];
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[103]++;
      ret = {
  status: 'status' in c ? c.status : 500, 
  statusText: visit142_105_1(c.statusText || e)};
      _$jscoverage['/io/xdr-flash-transport.js'].lineData[107]++;
      break;
  }
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[109]++;
  if (visit143_109_1(ret)) {
    _$jscoverage['/io/xdr-flash-transport.js'].lineData[110]++;
    io._ioReady(ret.status, ret.statusText);
  }
}});
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[116]++;
  IO['applyTo'] = function(_, cmd, args) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[7]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[117]++;
  var cmds = cmd.split('.').slice(1), func = IO;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[119]++;
  S.each(cmds, function(c) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[8]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[120]++;
  func = func[c];
});
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[122]++;
  func.apply(null, args);
};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[126]++;
  IO['xdrReady'] = function() {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[9]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[127]++;
  flash = doc.getElementById(ID);
};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[135]++;
  IO['xdrResponse'] = function(e, o) {
  _$jscoverage['/io/xdr-flash-transport.js'].functionData[10]++;
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[136]++;
  var xhr = maps[o.uid];
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[137]++;
  visit144_137_1(xhr && xhr._xdrResponse(e, o));
};
  _$jscoverage['/io/xdr-flash-transport.js'].lineData[140]++;
  return XdrFlashTransport;
});
