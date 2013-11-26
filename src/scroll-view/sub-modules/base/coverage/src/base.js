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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[13] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[43] = 0;
  _$jscoverage['/base.js'].lineData[47] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['22'] = [];
  _$jscoverage['/base.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['25'] = [];
  _$jscoverage['/base.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['61'] = [];
  _$jscoverage['/base.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['62'] = [];
  _$jscoverage['/base.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['63'] = [];
  _$jscoverage['/base.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['63'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['73'] = [];
  _$jscoverage['/base.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['77'] = [];
  _$jscoverage['/base.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['82'] = [];
  _$jscoverage['/base.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['85'] = [];
  _$jscoverage['/base.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['88'] = [];
  _$jscoverage['/base.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'] = [];
  _$jscoverage['/base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['96'] = [];
  _$jscoverage['/base.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['99'] = [];
  _$jscoverage['/base.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['109'] = [];
  _$jscoverage['/base.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['122'] = [];
  _$jscoverage['/base.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['134'] = [];
  _$jscoverage['/base.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'] = [];
  _$jscoverage['/base.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'] = [];
  _$jscoverage['/base.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'] = [];
  _$jscoverage['/base.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['158'] = [];
  _$jscoverage['/base.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['163'] = [];
  _$jscoverage['/base.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['187'] = [];
  _$jscoverage['/base.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['189'] = [];
  _$jscoverage['/base.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['194'] = [];
  _$jscoverage['/base.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['196'] = [];
  _$jscoverage['/base.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['207'] = [];
  _$jscoverage['/base.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['217'] = [];
  _$jscoverage['/base.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['220'] = [];
  _$jscoverage['/base.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['230'] = [];
  _$jscoverage['/base.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['233'] = [];
  _$jscoverage['/base.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['237'] = [];
  _$jscoverage['/base.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['249'] = [];
  _$jscoverage['/base.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['252'] = [];
  _$jscoverage['/base.js'].branchData['252'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['252'][1].init(131, 17, 'top !== undefined');
function visit58_252_1(result) {
  _$jscoverage['/base.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['249'][1].init(21, 18, 'left !== undefined');
function visit57_249_1(result) {
  _$jscoverage['/base.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['237'][1].init(245, 17, 'top !== undefined');
function visit56_237_1(result) {
  _$jscoverage['/base.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['233'][1].init(81, 18, 'left !== undefined');
function visit55_233_1(result) {
  _$jscoverage['/base.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['230'][1].init(110, 7, 'animCfg');
function visit54_230_1(result) {
  _$jscoverage['/base.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['220'][1].init(265, 7, 'cfg.top');
function visit53_220_1(result) {
  _$jscoverage['/base.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['217'][1].init(134, 8, 'cfg.left');
function visit52_217_1(result) {
  _$jscoverage['/base.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['207'][1].init(75, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit51_207_1(result) {
  _$jscoverage['/base.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['196'][1].init(70, 15, 'offset[p2] <= v');
function visit50_196_1(result) {
  _$jscoverage['/base.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['194'][1].init(50, 6, 'i >= 0');
function visit49_194_1(result) {
  _$jscoverage['/base.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['189'][1].init(70, 15, 'offset[p2] >= v');
function visit48_189_1(result) {
  _$jscoverage['/base.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['187'][1].init(29, 22, 'i < pagesOffset.length');
function visit47_187_1(result) {
  _$jscoverage['/base.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(254, 13, 'direction > 0');
function visit46_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['163'][1].init(46, 23, 'self.scrollAnims.length');
function visit45_163_1(result) {
  _$jscoverage['/base.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['158'][1].init(37, 11, 'axis == \'x\'');
function visit44_158_1(result) {
  _$jscoverage['/base.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][7].init(210, 10, 'deltaX < 0');
function visit43_149_7(result) {
  _$jscoverage['/base.js'].branchData['149'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][6].init(189, 17, 'scrollLeft >= max');
function visit42_149_6(result) {
  _$jscoverage['/base.js'].branchData['149'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][5].init(189, 31, 'scrollLeft >= max && deltaX < 0');
function visit41_149_5(result) {
  _$jscoverage['/base.js'].branchData['149'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][4].init(175, 10, 'deltaX > 0');
function visit40_149_4(result) {
  _$jscoverage['/base.js'].branchData['149'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][3].init(154, 17, 'scrollLeft <= min');
function visit39_149_3(result) {
  _$jscoverage['/base.js'].branchData['149'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][2].init(154, 31, 'scrollLeft <= min && deltaX > 0');
function visit38_149_2(result) {
  _$jscoverage['/base.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][1].init(154, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit37_149_1(result) {
  _$jscoverage['/base.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][1].init(830, 46, '(deltaX = e.deltaX) && self.allowScroll[\'left\']');
function visit36_145_1(result) {
  _$jscoverage['/base.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][7].init(204, 10, 'deltaY < 0');
function visit35_138_7(result) {
  _$jscoverage['/base.js'].branchData['138'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][6].init(184, 16, 'scrollTop >= max');
function visit34_138_6(result) {
  _$jscoverage['/base.js'].branchData['138'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][5].init(184, 30, 'scrollTop >= max && deltaY < 0');
function visit33_138_5(result) {
  _$jscoverage['/base.js'].branchData['138'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][4].init(170, 10, 'deltaY > 0');
function visit32_138_4(result) {
  _$jscoverage['/base.js'].branchData['138'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][3].init(150, 16, 'scrollTop <= min');
function visit31_138_3(result) {
  _$jscoverage['/base.js'].branchData['138'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][2].init(150, 30, 'scrollTop <= min && deltaY > 0');
function visit30_138_2(result) {
  _$jscoverage['/base.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][1].init(150, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit29_138_1(result) {
  _$jscoverage['/base.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['134'][1].init(355, 45, '(deltaY = e.deltaY) && self.allowScroll[\'top\']');
function visit28_134_1(result) {
  _$jscoverage['/base.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['122'][1].init(17, 20, 'this.get(\'disabled\')');
function visit27_122_1(result) {
  _$jscoverage['/base.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['109'][1].init(49, 18, 'control.scrollStep');
function visit26_109_1(result) {
  _$jscoverage['/base.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['99'][1].init(295, 23, 'keyCode == KeyCode.LEFT');
function visit25_99_1(result) {
  _$jscoverage['/base.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['96'][1].init(129, 24, 'keyCode == KeyCode.RIGHT');
function visit24_96_1(result) {
  _$jscoverage['/base.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][1].init(1629, 6, 'allowX');
function visit23_93_1(result) {
  _$jscoverage['/base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['88'][1].init(719, 26, 'keyCode == KeyCode.PAGE_UP');
function visit22_88_1(result) {
  _$jscoverage['/base.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['85'][1].init(550, 28, 'keyCode == KeyCode.PAGE_DOWN');
function visit21_85_1(result) {
  _$jscoverage['/base.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['82'][1].init(389, 21, 'keyCode == KeyCode.UP');
function visit20_82_1(result) {
  _$jscoverage['/base.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['77'][1].init(180, 23, 'keyCode == KeyCode.DOWN');
function visit19_77_1(result) {
  _$jscoverage['/base.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['73'][1].init(717, 6, 'allowY');
function visit18_73_1(result) {
  _$jscoverage['/base.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['63'][2].init(328, 20, 'nodeName == \'select\'');
function visit17_63_2(result) {
  _$jscoverage['/base.js'].branchData['63'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['63'][1].init(41, 74, 'nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit16_63_1(result) {
  _$jscoverage['/base.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['62'][2].init(285, 22, 'nodeName == \'textarea\'');
function visit15_62_2(result) {
  _$jscoverage['/base.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['62'][1].init(38, 116, 'nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit14_62_1(result) {
  _$jscoverage['/base.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['61'][2].init(244, 19, 'nodeName == \'input\'');
function visit13_61_2(result) {
  _$jscoverage['/base.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['61'][1].init(244, 155, 'nodeName == \'input\' || nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit12_61_1(result) {
  _$jscoverage['/base.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['25'][1].init(247, 10, 'scrollLeft');
function visit11_25_1(result) {
  _$jscoverage['/base.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['22'][1].init(142, 9, 'scrollTop');
function visit10_22_1(result) {
  _$jscoverage['/base.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/base.js'].lineData[8]++;
  var Anim = require('anim');
  _$jscoverage['/base.js'].lineData[9]++;
  var Container = require('component/container');
  _$jscoverage['/base.js'].lineData[10]++;
  var Render = require('./base/render');
  _$jscoverage['/base.js'].lineData[13]++;
  var $ = S.all, isTouchEventSupported = S.Features.isTouchEventSupported(), KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[17]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[18]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[22]++;
    if (visit10_22_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[23]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[25]++;
    if (visit11_25_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[26]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[28]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[31]++;
  function frame(anim, fx) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[32]++;
    anim.scrollView.set(fx.prop, fx.val);
  }
  _$jscoverage['/base.js'].lineData[41]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[43]++;
  this.scrollAnims = [];
}, 
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[47]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[52]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[57]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[61]++;
  if (visit12_61_1(visit13_61_2(nodeName == 'input') || visit14_62_1(visit15_62_2(nodeName == 'textarea') || visit16_63_1(visit17_63_2(nodeName == 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[65]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[67]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok = undefined;
  _$jscoverage['/base.js'].lineData[71]++;
  var allowX = self.allowScroll['left'];
  _$jscoverage['/base.js'].lineData[72]++;
  var allowY = self.allowScroll['top'];
  _$jscoverage['/base.js'].lineData[73]++;
  if (visit18_73_1(allowY)) {
    _$jscoverage['/base.js'].lineData[74]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[77]++;
    if (visit19_77_1(keyCode == KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[78]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[81]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[82]++;
      if (visit20_82_1(keyCode == KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[83]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[84]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[85]++;
        if (visit21_85_1(keyCode == KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[86]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[87]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[88]++;
          if (visit22_88_1(keyCode == KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[89]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[90]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[93]++;
  if (visit23_93_1(allowX)) {
    _$jscoverage['/base.js'].lineData[94]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[95]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[96]++;
    if (visit24_96_1(keyCode == KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[97]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[98]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[99]++;
      if (visit25_99_1(keyCode == KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[100]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[101]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[104]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[108]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[109]++;
  if (visit26_109_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[110]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[112]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[113]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[114]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[115]++;
  return control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[122]++;
  if (visit27_122_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[123]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[125]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[134]++;
  if (visit28_134_1((deltaY = e.deltaY) && self.allowScroll['top'])) {
    _$jscoverage['/base.js'].lineData[135]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[136]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[137]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[138]++;
    if (visit29_138_1(visit30_138_2(visit31_138_3(scrollTop <= min) && visit32_138_4(deltaY > 0)) || visit33_138_5(visit34_138_6(scrollTop >= max) && visit35_138_7(deltaY < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[140]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep['top']});
      _$jscoverage['/base.js'].lineData[141]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/base.js'].lineData[145]++;
  if (visit36_145_1((deltaX = e.deltaX) && self.allowScroll['left'])) {
    _$jscoverage['/base.js'].lineData[146]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[147]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[148]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[149]++;
    if (visit37_149_1(visit38_149_2(visit39_149_3(scrollLeft <= min) && visit40_149_4(deltaX > 0)) || visit41_149_5(visit42_149_6(scrollLeft >= max) && visit43_149_7(deltaX < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[151]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep['left']});
      _$jscoverage['/base.js'].lineData[152]++;
      e.preventDefault();
    }
  }
}, 
  'isAxisEnabled': function(axis) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[158]++;
  return this.allowScroll[visit44_158_1(axis == 'x') ? 'left' : 'top'];
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[162]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[163]++;
  if (visit45_163_1(self.scrollAnims.length)) {
    _$jscoverage['/base.js'].lineData[164]++;
    S.each(self.scrollAnims, function(scrollAnim) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[165]++;
  scrollAnim.stop();
});
    _$jscoverage['/base.js'].lineData[167]++;
    self.scrollAnims = [];
  }
  _$jscoverage['/base.js'].lineData[169]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[176]++;
  this.scrollToPage(v);
}, 
  _getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[180]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[181]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[182]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[183]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[184]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[186]++;
  if (visit46_186_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[187]++;
    for (i = 0; visit47_187_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[188]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[189]++;
      if (visit48_189_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[190]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[194]++;
    for (i = pagesOffset.length - 1; visit49_194_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[195]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[196]++;
      if (visit50_196_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[197]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[201]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[205]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[207]++;
  if (visit51_207_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[208]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[209]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[214]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[215]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[216]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[217]++;
  if (visit52_217_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[218]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[220]++;
  if (visit53_220_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[221]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[223]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, animCfg) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[227]++;
  var self = this, left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[230]++;
  if (visit54_230_1(animCfg)) {
    _$jscoverage['/base.js'].lineData[231]++;
    var node = {}, to = {};
    _$jscoverage['/base.js'].lineData[233]++;
    if (visit55_233_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[234]++;
      to.scrollLeft = left;
      _$jscoverage['/base.js'].lineData[235]++;
      node.scrollLeft = self.get('scrollLeft');
    }
    _$jscoverage['/base.js'].lineData[237]++;
    if (visit56_237_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[238]++;
      to.scrollTop = top;
      _$jscoverage['/base.js'].lineData[239]++;
      node.scrollTop = self.get('scrollTop');
    }
    _$jscoverage['/base.js'].lineData[241]++;
    animCfg.frame = frame;
    _$jscoverage['/base.js'].lineData[242]++;
    animCfg.node = node;
    _$jscoverage['/base.js'].lineData[243]++;
    animCfg.to = to;
    _$jscoverage['/base.js'].lineData[244]++;
    var anim;
    _$jscoverage['/base.js'].lineData[245]++;
    self.scrollAnims.push(anim = new Anim(animCfg));
    _$jscoverage['/base.js'].lineData[246]++;
    anim.scrollView = self;
    _$jscoverage['/base.js'].lineData[247]++;
    anim.run();
  } else {
    _$jscoverage['/base.js'].lineData[249]++;
    if (visit57_249_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[250]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[252]++;
    if (visit58_252_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[253]++;
      self.set('scrollTop', top);
    }
  }
}}, {
  ATTRS: {
  contentEl: {}, 
  scrollLeft: {
  view: 1, 
  value: 0}, 
  scrollTop: {
  view: 1, 
  value: 0}, 
  focusable: {
  value: !isTouchEventSupported}, 
  allowTextSelection: {
  value: true}, 
  handleMouseEvents: {
  value: false}, 
  snap: {
  value: false}, 
  pageIndex: {
  value: 0}, 
  xrender: {
  value: Render}}, 
  xclass: 'scroll-view'});
});
