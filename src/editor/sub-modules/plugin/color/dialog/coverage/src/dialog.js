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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[7] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[12] = 0;
  _$jscoverage['/dialog.js'].lineData[15] = 0;
  _$jscoverage['/dialog.js'].lineData[16] = 0;
  _$jscoverage['/dialog.js'].lineData[17] = 0;
  _$jscoverage['/dialog.js'].lineData[19] = 0;
  _$jscoverage['/dialog.js'].lineData[20] = 0;
  _$jscoverage['/dialog.js'].lineData[22] = 0;
  _$jscoverage['/dialog.js'].lineData[23] = 0;
  _$jscoverage['/dialog.js'].lineData[25] = 0;
  _$jscoverage['/dialog.js'].lineData[27] = 0;
  _$jscoverage['/dialog.js'].lineData[28] = 0;
  _$jscoverage['/dialog.js'].lineData[30] = 0;
  _$jscoverage['/dialog.js'].lineData[32] = 0;
  _$jscoverage['/dialog.js'].lineData[33] = 0;
  _$jscoverage['/dialog.js'].lineData[36] = 0;
  _$jscoverage['/dialog.js'].lineData[42] = 0;
  _$jscoverage['/dialog.js'].lineData[44] = 0;
  _$jscoverage['/dialog.js'].lineData[45] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[47] = 0;
  _$jscoverage['/dialog.js'].lineData[48] = 0;
  _$jscoverage['/dialog.js'].lineData[52] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[54] = 0;
  _$jscoverage['/dialog.js'].lineData[55] = 0;
  _$jscoverage['/dialog.js'].lineData[56] = 0;
  _$jscoverage['/dialog.js'].lineData[58] = 0;
  _$jscoverage['/dialog.js'].lineData[60] = 0;
  _$jscoverage['/dialog.js'].lineData[61] = 0;
  _$jscoverage['/dialog.js'].lineData[62] = 0;
  _$jscoverage['/dialog.js'].lineData[68] = 0;
  _$jscoverage['/dialog.js'].lineData[70] = 0;
  _$jscoverage['/dialog.js'].lineData[71] = 0;
  _$jscoverage['/dialog.js'].lineData[72] = 0;
  _$jscoverage['/dialog.js'].lineData[73] = 0;
  _$jscoverage['/dialog.js'].lineData[74] = 0;
  _$jscoverage['/dialog.js'].lineData[75] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[78] = 0;
  _$jscoverage['/dialog.js'].lineData[79] = 0;
  _$jscoverage['/dialog.js'].lineData[81] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[85] = 0;
  _$jscoverage['/dialog.js'].lineData[87] = 0;
  _$jscoverage['/dialog.js'].lineData[88] = 0;
  _$jscoverage['/dialog.js'].lineData[91] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[96] = 0;
  _$jscoverage['/dialog.js'].lineData[97] = 0;
  _$jscoverage['/dialog.js'].lineData[98] = 0;
  _$jscoverage['/dialog.js'].lineData[100] = 0;
  _$jscoverage['/dialog.js'].lineData[101] = 0;
  _$jscoverage['/dialog.js'].lineData[102] = 0;
  _$jscoverage['/dialog.js'].lineData[103] = 0;
  _$jscoverage['/dialog.js'].lineData[104] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[106] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[117] = 0;
  _$jscoverage['/dialog.js'].lineData[118] = 0;
  _$jscoverage['/dialog.js'].lineData[119] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[124] = 0;
  _$jscoverage['/dialog.js'].lineData[127] = 0;
  _$jscoverage['/dialog.js'].lineData[130] = 0;
  _$jscoverage['/dialog.js'].lineData[132] = 0;
  _$jscoverage['/dialog.js'].lineData[157] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[162] = 0;
  _$jscoverage['/dialog.js'].lineData[164] = 0;
  _$jscoverage['/dialog.js'].lineData[166] = 0;
  _$jscoverage['/dialog.js'].lineData[170] = 0;
  _$jscoverage['/dialog.js'].lineData[181] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[191] = 0;
  _$jscoverage['/dialog.js'].lineData[193] = 0;
  _$jscoverage['/dialog.js'].lineData[195] = 0;
  _$jscoverage['/dialog.js'].lineData[196] = 0;
  _$jscoverage['/dialog.js'].lineData[199] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[203] = 0;
  _$jscoverage['/dialog.js'].lineData[207] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[209] = 0;
  _$jscoverage['/dialog.js'].lineData[210] = 0;
  _$jscoverage['/dialog.js'].lineData[211] = 0;
  _$jscoverage['/dialog.js'].lineData[213] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[218] = 0;
  _$jscoverage['/dialog.js'].lineData[219] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[222] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[224] = 0;
  _$jscoverage['/dialog.js'].lineData[225] = 0;
  _$jscoverage['/dialog.js'].lineData[226] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[229] = 0;
  _$jscoverage['/dialog.js'].lineData[230] = 0;
  _$jscoverage['/dialog.js'].lineData[233] = 0;
  _$jscoverage['/dialog.js'].lineData[235] = 0;
  _$jscoverage['/dialog.js'].lineData[236] = 0;
  _$jscoverage['/dialog.js'].lineData[237] = 0;
  _$jscoverage['/dialog.js'].lineData[238] = 0;
  _$jscoverage['/dialog.js'].lineData[242] = 0;
  _$jscoverage['/dialog.js'].lineData[249] = 0;
  _$jscoverage['/dialog.js'].lineData[251] = 0;
  _$jscoverage['/dialog.js'].lineData[255] = 0;
  _$jscoverage['/dialog.js'].lineData[256] = 0;
  _$jscoverage['/dialog.js'].lineData[259] = 0;
  _$jscoverage['/dialog.js'].lineData[262] = 0;
  _$jscoverage['/dialog.js'].lineData[266] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
  _$jscoverage['/dialog.js'].functionData[13] = 0;
  _$jscoverage['/dialog.js'].functionData[14] = 0;
  _$jscoverage['/dialog.js'].functionData[15] = 0;
  _$jscoverage['/dialog.js'].functionData[16] = 0;
  _$jscoverage['/dialog.js'].functionData[17] = 0;
  _$jscoverage['/dialog.js'].functionData[18] = 0;
  _$jscoverage['/dialog.js'].functionData[19] = 0;
  _$jscoverage['/dialog.js'].functionData[20] = 0;
  _$jscoverage['/dialog.js'].functionData[21] = 0;
  _$jscoverage['/dialog.js'].functionData[22] = 0;
  _$jscoverage['/dialog.js'].functionData[23] = 0;
  _$jscoverage['/dialog.js'].functionData[24] = 0;
  _$jscoverage['/dialog.js'].functionData[25] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['16'] = [];
  _$jscoverage['/dialog.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['20'] = [];
  _$jscoverage['/dialog.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['25'] = [];
  _$jscoverage['/dialog.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['30'] = [];
  _$jscoverage['/dialog.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['33'] = [];
  _$jscoverage['/dialog.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['52'] = [];
  _$jscoverage['/dialog.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['72'] = [];
  _$jscoverage['/dialog.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['73'] = [];
  _$jscoverage['/dialog.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['84'] = [];
  _$jscoverage['/dialog.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['97'] = [];
  _$jscoverage['/dialog.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['100'] = [];
  _$jscoverage['/dialog.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['102'] = [];
  _$jscoverage['/dialog.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['103'] = [];
  _$jscoverage['/dialog.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['104'] = [];
  _$jscoverage['/dialog.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['106'] = [];
  _$jscoverage['/dialog.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['193'] = [];
  _$jscoverage['/dialog.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['209'] = [];
  _$jscoverage['/dialog.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['224'] = [];
  _$jscoverage['/dialog.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['226'] = [];
  _$jscoverage['/dialog.js'].branchData['226'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['226'][1].init(87, 16, 'left.contains(t)');
function visit19_226_1(result) {
  _$jscoverage['/dialog.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['224'][1].init(89, 20, 't.nodeName() === \'a\'');
function visit18_224_1(result) {
  _$jscoverage['/dialog.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['209'][1].init(80, 35, '!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)');
function visit17_209_1(result) {
  _$jscoverage['/dialog.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['193'][1].init(143, 35, '!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)');
function visit16_193_1(result) {
  _$jscoverage['/dialog.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['106'][1].init(143, 9, 'i < n - 1');
function visit15_106_1(result) {
  _$jscoverage['/dialog.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['104'][1].init(30, 15, 'step[i] || step');
function visit14_104_1(result) {
  _$jscoverage['/dialog.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['103'][1].init(47, 5, 'i < n');
function visit13_103_1(result) {
  _$jscoverage['/dialog.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['102'][1].init(246, 7, 'len > 1');
function visit12_102_1(result) {
  _$jscoverage['/dialog.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['100'][1].init(148, 9, 'len === 1');
function visit11_100_1(result) {
  _$jscoverage['/dialog.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['97'][1].init(66, 18, 'step === undefined');
function visit10_97_1(result) {
  _$jscoverage['/dialog.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['84'][1].init(401, 20, 'document.defaultView');
function visit9_84_1(result) {
  _$jscoverage['/dialog.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['73'][1].init(22, 5, '!frag');
function visit8_73_1(result) {
  _$jscoverage['/dialog.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['72'][1].init(57, 17, 'ret === undefined');
function visit7_72_1(result) {
  _$jscoverage['/dialog.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['52'][1].init(355, 8, 'i < step');
function visit6_52_1(result) {
  _$jscoverage['/dialog.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['33'][1].init(25, 18, 'x.indexOf(\'%\') > 0');
function visit5_33_1(result) {
  _$jscoverage['/dialog.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['30'][1].init(560, 38, '/^rgb\\((.*),(.*),(.*)\\)$/i.test(color)');
function visit4_30_1(result) {
  _$jscoverage['/dialog.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['25'][1].init(341, 48, '/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color)');
function visit3_25_1(result) {
  _$jscoverage['/dialog.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['20'][1].init(114, 57, '/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color)');
function visit2_20_1(result) {
  _$jscoverage['/dialog.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['16'][1].init(14, 19, 'util.isArray(color)');
function visit1_16_1(result) {
  _$jscoverage['/dialog.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var Dialog4E = require('../dialog');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var map = util.map, Dom = require('dom');
  _$jscoverage['/dialog.js'].lineData[12]++;
  var $ = Node.all;
  _$jscoverage['/dialog.js'].lineData[15]++;
  function getData(color) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[16]++;
    if (visit1_16_1(util.isArray(color))) {
      _$jscoverage['/dialog.js'].lineData[17]++;
      return color;
    }
    _$jscoverage['/dialog.js'].lineData[19]++;
    var re = RegExp;
    _$jscoverage['/dialog.js'].lineData[20]++;
    if (visit2_20_1(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color))) {
      _$jscoverage['/dialog.js'].lineData[22]++;
      return map([re.$1, re.$2, re.$3], function(x) {
  _$jscoverage['/dialog.js'].functionData[2]++;
  _$jscoverage['/dialog.js'].lineData[23]++;
  return parseInt(x, 16);
});
    } else {
      _$jscoverage['/dialog.js'].lineData[25]++;
      if (visit3_25_1(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color))) {
        _$jscoverage['/dialog.js'].lineData[27]++;
        return map([re.$1, re.$2, re.$3], function(x) {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[28]++;
  return parseInt(x + x, 16);
});
      } else {
        _$jscoverage['/dialog.js'].lineData[30]++;
        if (visit4_30_1(/^rgb\((.*),(.*),(.*)\)$/i.test(color))) {
          _$jscoverage['/dialog.js'].lineData[32]++;
          return map([re.$1, re.$2, re.$3], function(x) {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[33]++;
  return visit5_33_1(x.indexOf('%') > 0) ? parseFloat(x, 10) * 2.55 : x | 0;
});
        }
      }
    }
    _$jscoverage['/dialog.js'].lineData[36]++;
    return undefined;
  }
  _$jscoverage['/dialog.js'].lineData[42]++;
  var colorGrads = (function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[44]++;
  function getStep(start, end, step) {
    _$jscoverage['/dialog.js'].functionData[6]++;
    _$jscoverage['/dialog.js'].lineData[45]++;
    var colors = [];
    _$jscoverage['/dialog.js'].lineData[46]++;
    start = getColor(start);
    _$jscoverage['/dialog.js'].lineData[47]++;
    end = getColor(end);
    _$jscoverage['/dialog.js'].lineData[48]++;
    var stepR = (end[0] - start[0]) / step, stepG = (end[1] - start[1]) / step, stepB = (end[2] - start[2]) / step;
    _$jscoverage['/dialog.js'].lineData[52]++;
    for (var i = 0, r = start[0], g = start[1], b = start[2]; visit6_52_1(i < step); i++) {
      _$jscoverage['/dialog.js'].lineData[53]++;
      colors[i] = [r, g, b];
      _$jscoverage['/dialog.js'].lineData[54]++;
      r += stepR;
      _$jscoverage['/dialog.js'].lineData[55]++;
      g += stepG;
      _$jscoverage['/dialog.js'].lineData[56]++;
      b += stepB;
    }
    _$jscoverage['/dialog.js'].lineData[58]++;
    colors[i] = end;
    _$jscoverage['/dialog.js'].lineData[60]++;
    return map(colors, function(x) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[61]++;
  return map(x, function(x) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[62]++;
  return Math.min(Math.max(0, Math.floor(x)), 255);
});
});
  }
  _$jscoverage['/dialog.js'].lineData[68]++;
  var frag;
  _$jscoverage['/dialog.js'].lineData[70]++;
  function getColor(color) {
    _$jscoverage['/dialog.js'].functionData[9]++;
    _$jscoverage['/dialog.js'].lineData[71]++;
    var ret = getData(color);
    _$jscoverage['/dialog.js'].lineData[72]++;
    if (visit7_72_1(ret === undefined)) {
      _$jscoverage['/dialog.js'].lineData[73]++;
      if (visit8_73_1(!frag)) {
        _$jscoverage['/dialog.js'].lineData[74]++;
        frag = document.createElement('textarea');
        _$jscoverage['/dialog.js'].lineData[75]++;
        frag.style.display = 'none';
        _$jscoverage['/dialog.js'].lineData[76]++;
        Dom.prepend(frag, document.body);
      }
      _$jscoverage['/dialog.js'].lineData[78]++;
      try {
        _$jscoverage['/dialog.js'].lineData[79]++;
        frag.style.color = color;
      }      catch (e) {
  _$jscoverage['/dialog.js'].lineData[81]++;
  return [0, 0, 0];
}
      _$jscoverage['/dialog.js'].lineData[84]++;
      if (visit9_84_1(document.defaultView)) {
        _$jscoverage['/dialog.js'].lineData[85]++;
        ret = getData(document.defaultView.getComputedStyle(frag, null).color);
      } else {
        _$jscoverage['/dialog.js'].lineData[87]++;
        color = frag.createTextRange().queryCommandValue('ForeColor');
        _$jscoverage['/dialog.js'].lineData[88]++;
        ret = [color & 0x0000ff, (color & 0x00ff00) >>> 8, (color & 0xff0000) >>> 16];
      }
    }
    _$jscoverage['/dialog.js'].lineData[91]++;
    return ret;
  }
  _$jscoverage['/dialog.js'].lineData[95]++;
  return function(colors, step) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[96]++;
  var ret = [], len = colors.length;
  _$jscoverage['/dialog.js'].lineData[97]++;
  if (visit10_97_1(step === undefined)) {
    _$jscoverage['/dialog.js'].lineData[98]++;
    step = 20;
  }
  _$jscoverage['/dialog.js'].lineData[100]++;
  if (visit11_100_1(len === 1)) {
    _$jscoverage['/dialog.js'].lineData[101]++;
    ret = getStep(colors[0], colors[0], step);
  } else {
    _$jscoverage['/dialog.js'].lineData[102]++;
    if (visit12_102_1(len > 1)) {
      _$jscoverage['/dialog.js'].lineData[103]++;
      for (var i = 0, n = len - 1; visit13_103_1(i < n); i++) {
        _$jscoverage['/dialog.js'].lineData[104]++;
        var t = visit14_104_1(step[i] || step);
        _$jscoverage['/dialog.js'].lineData[105]++;
        var steps = getStep(colors[i], colors[i + 1], t);
        _$jscoverage['/dialog.js'].lineData[106]++;
        if (visit15_106_1(i < n - 1)) {
          _$jscoverage['/dialog.js'].lineData[107]++;
          steps.pop();
        }
        _$jscoverage['/dialog.js'].lineData[109]++;
        ret = ret.concat(steps);
      }
    }
  }
  _$jscoverage['/dialog.js'].lineData[112]++;
  return ret;
};
})();
  _$jscoverage['/dialog.js'].lineData[116]++;
  function padding2(x) {
    _$jscoverage['/dialog.js'].functionData[11]++;
    _$jscoverage['/dialog.js'].lineData[117]++;
    x = '0' + x;
    _$jscoverage['/dialog.js'].lineData[118]++;
    var l = x.length;
    _$jscoverage['/dialog.js'].lineData[119]++;
    return x.slice(l - 2, l);
  }
  _$jscoverage['/dialog.js'].lineData[122]++;
  function hex(c) {
    _$jscoverage['/dialog.js'].functionData[12]++;
    _$jscoverage['/dialog.js'].lineData[123]++;
    c = getData(c);
    _$jscoverage['/dialog.js'].lineData[124]++;
    return '#' + padding2(c[0].toString(16)) + padding2(c[1].toString(16)) + padding2(c[2].toString(16));
  }
  _$jscoverage['/dialog.js'].lineData[127]++;
  var pickerHTML = '<ul>' + map(colorGrads(['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'], 5), function(x) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[130]++;
  return map(colorGrads(['white', 'rgb(' + x.join(',') + ')', 'black'], 5), function(x) {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[132]++;
  return '<li><a style="background-color' + ':' + hex(x) + '" href="#"></a></li>';
}).join('');
}).join('</ul><ul>') + '</ul>', panelHTML = '<div class="{prefixCls}editor-color-advanced-picker">' + '<div class="ks-clear">' + '<div class="{prefixCls}editor-color-advanced-picker-left">' + pickerHTML + '</div>' + '<div class="{prefixCls}editor-color-advanced-picker-right">' + '</div>' + '</div>' + '<div style="padding:10px;">' + '<label>' + '\u989c\u8272\u503c\uff1a ' + '<input style="width:100px" class="{prefixCls}editor-color-advanced-value"/>' + '</label>' + '<span class="{prefixCls}editor-color-advanced-indicator"></span>' + '</div>' + '</div>', footHTML = '<div style="padding:5px 20px 20px;">' + '<a class="{prefixCls}editor-button {prefixCls}editor-color-advanced-ok ks-inline-block">\u786e\u5b9a</a>' + '&nbsp;&nbsp;&nbsp;' + '<a class="{prefixCls}editor-button  {prefixCls}editor-color-advanced-cancel ks-inline-block">\u53d6\u6d88</a>' + '</div>';
  _$jscoverage['/dialog.js'].lineData[157]++;
  function ColorPicker(editor) {
    _$jscoverage['/dialog.js'].functionData[15]++;
    _$jscoverage['/dialog.js'].lineData[158]++;
    this.editor = editor;
    _$jscoverage['/dialog.js'].lineData[159]++;
    this._init();
  }
  _$jscoverage['/dialog.js'].lineData[162]++;
  var addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/dialog.js'].lineData[164]++;
  util.augment(ColorPicker, {
  _init: function() {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[166]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[170]++;
  self.dialog = new Dialog4E({
  mask: true, 
  headerContent: '\u989c\u8272\u62fe\u53d6\u5668', 
  bodyContent: util.substitute(panelHTML, {
  prefixCls: prefixCls}), 
  footerContent: util.substitute(footHTML, {
  prefixCls: prefixCls}), 
  width: '550px'}).render();
  _$jscoverage['/dialog.js'].lineData[181]++;
  var win = self.dialog, body = win.get('body'), foot = win.get('footer'), indicator = body.one('.' + prefixCls + 'editor-color-advanced-indicator'), indicatorValue = body.one('.' + prefixCls + 'editor-color-advanced-value'), left = body.one('.' + prefixCls + 'editor-color-advanced-picker-left'), ok = foot.one('.' + prefixCls + 'editor-color-advanced-ok'), cancel = foot.one('.' + prefixCls + 'editor-color-advanced-cancel');
  _$jscoverage['/dialog.js'].lineData[190]++;
  ok.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[191]++;
  var v = util.trim(indicatorValue.val()), colorButtonArrow = self.colorButtonArrow;
  _$jscoverage['/dialog.js'].lineData[193]++;
  if (visit16_193_1(!/^#([a-f0-9]{1,2}){3,3}$/i.test(v))) {
    _$jscoverage['/dialog.js'].lineData[195]++;
    alert('\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u989c\u8272\u4ee3\u7801');
    _$jscoverage['/dialog.js'].lineData[196]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[199]++;
  self.hide();
  _$jscoverage['/dialog.js'].lineData[200]++;
  colorButtonArrow.fire('selectColor', {
  color: indicatorValue.val()});
  _$jscoverage['/dialog.js'].lineData[203]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[207]++;
  indicatorValue.on('change', function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[208]++;
  var v = util.trim(indicatorValue.val());
  _$jscoverage['/dialog.js'].lineData[209]++;
  if (visit17_209_1(!/^#([a-f0-9]{1,2}){3,3}$/i.test(v))) {
    _$jscoverage['/dialog.js'].lineData[210]++;
    alert('\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u989c\u8272\u4ee3\u7801');
    _$jscoverage['/dialog.js'].lineData[211]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[213]++;
  indicator.css('background-color', v);
});
  _$jscoverage['/dialog.js'].lineData[217]++;
  cancel.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[19]++;
  _$jscoverage['/dialog.js'].lineData[218]++;
  self.hide();
  _$jscoverage['/dialog.js'].lineData[219]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[221]++;
  body.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[20]++;
  _$jscoverage['/dialog.js'].lineData[222]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[223]++;
  var t = $(ev.target);
  _$jscoverage['/dialog.js'].lineData[224]++;
  if (visit18_224_1(t.nodeName() === 'a')) {
    _$jscoverage['/dialog.js'].lineData[225]++;
    var c = hex(t.css('background-color'));
    _$jscoverage['/dialog.js'].lineData[226]++;
    if (visit19_226_1(left.contains(t))) {
      _$jscoverage['/dialog.js'].lineData[227]++;
      self._detailColor(c);
    }
    _$jscoverage['/dialog.js'].lineData[229]++;
    indicatorValue.val(c);
    _$jscoverage['/dialog.js'].lineData[230]++;
    indicator.css('background-color', c);
  }
});
  _$jscoverage['/dialog.js'].lineData[233]++;
  addRes.call(self, ok, indicatorValue, cancel, body, self.dialog);
  _$jscoverage['/dialog.js'].lineData[235]++;
  var defaultColor = '#FF9900';
  _$jscoverage['/dialog.js'].lineData[236]++;
  self._detailColor(defaultColor);
  _$jscoverage['/dialog.js'].lineData[237]++;
  indicatorValue.val(defaultColor);
  _$jscoverage['/dialog.js'].lineData[238]++;
  indicator.css('background-color', defaultColor);
}, 
  _detailColor: function(color) {
  _$jscoverage['/dialog.js'].functionData[21]++;
  _$jscoverage['/dialog.js'].lineData[242]++;
  var self = this, win = self.dialog, body = win.get('body'), editor = self.editor, prefixCls = editor.get('prefixCls'), detailPanel = body.one('.' + prefixCls + 'editor-color-advanced-picker-right');
  _$jscoverage['/dialog.js'].lineData[249]++;
  detailPanel.html(map(colorGrads(['#ffffff', color, '#000000'], 40), function(x) {
  _$jscoverage['/dialog.js'].functionData[22]++;
  _$jscoverage['/dialog.js'].lineData[251]++;
  return '<a style="background-color:' + hex(x) + '"></a>';
}).join(''));
}, 
  show: function(colorButtonArrow) {
  _$jscoverage['/dialog.js'].functionData[23]++;
  _$jscoverage['/dialog.js'].lineData[255]++;
  this.colorButtonArrow = colorButtonArrow;
  _$jscoverage['/dialog.js'].lineData[256]++;
  this.dialog.show();
}, 
  hide: function() {
  _$jscoverage['/dialog.js'].functionData[24]++;
  _$jscoverage['/dialog.js'].lineData[259]++;
  this.dialog.hide();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[25]++;
  _$jscoverage['/dialog.js'].lineData[262]++;
  destroyRes.call(this);
}});
  _$jscoverage['/dialog.js'].lineData[266]++;
  return ColorPicker;
});
