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
if (! _$jscoverage['/lang/escape.js']) {
  _$jscoverage['/lang/escape.js'] = {};
  _$jscoverage['/lang/escape.js'].lineData = [];
  _$jscoverage['/lang/escape.js'].lineData[7] = 0;
  _$jscoverage['/lang/escape.js'].lineData[11] = 0;
  _$jscoverage['/lang/escape.js'].lineData[12] = 0;
  _$jscoverage['/lang/escape.js'].lineData[35] = 0;
  _$jscoverage['/lang/escape.js'].lineData[36] = 0;
  _$jscoverage['/lang/escape.js'].lineData[37] = 0;
  _$jscoverage['/lang/escape.js'].lineData[41] = 0;
  _$jscoverage['/lang/escape.js'].lineData[42] = 0;
  _$jscoverage['/lang/escape.js'].lineData[44] = 0;
  _$jscoverage['/lang/escape.js'].lineData[47] = 0;
  _$jscoverage['/lang/escape.js'].lineData[48] = 0;
  _$jscoverage['/lang/escape.js'].lineData[49] = 0;
  _$jscoverage['/lang/escape.js'].lineData[51] = 0;
  _$jscoverage['/lang/escape.js'].lineData[52] = 0;
  _$jscoverage['/lang/escape.js'].lineData[53] = 0;
  _$jscoverage['/lang/escape.js'].lineData[55] = 0;
  _$jscoverage['/lang/escape.js'].lineData[56] = 0;
  _$jscoverage['/lang/escape.js'].lineData[59] = 0;
  _$jscoverage['/lang/escape.js'].lineData[60] = 0;
  _$jscoverage['/lang/escape.js'].lineData[61] = 0;
  _$jscoverage['/lang/escape.js'].lineData[63] = 0;
  _$jscoverage['/lang/escape.js'].lineData[64] = 0;
  _$jscoverage['/lang/escape.js'].lineData[65] = 0;
  _$jscoverage['/lang/escape.js'].lineData[67] = 0;
  _$jscoverage['/lang/escape.js'].lineData[68] = 0;
  _$jscoverage['/lang/escape.js'].lineData[71] = 0;
  _$jscoverage['/lang/escape.js'].lineData[80] = 0;
  _$jscoverage['/lang/escape.js'].lineData[91] = 0;
  _$jscoverage['/lang/escape.js'].lineData[100] = 0;
  _$jscoverage['/lang/escape.js'].lineData[101] = 0;
  _$jscoverage['/lang/escape.js'].lineData[118] = 0;
  _$jscoverage['/lang/escape.js'].lineData[119] = 0;
  _$jscoverage['/lang/escape.js'].lineData[130] = 0;
  _$jscoverage['/lang/escape.js'].lineData[142] = 0;
  _$jscoverage['/lang/escape.js'].lineData[143] = 0;
  _$jscoverage['/lang/escape.js'].lineData[165] = 0;
  _$jscoverage['/lang/escape.js'].lineData[166] = 0;
  _$jscoverage['/lang/escape.js'].lineData[167] = 0;
  _$jscoverage['/lang/escape.js'].lineData[168] = 0;
  _$jscoverage['/lang/escape.js'].lineData[170] = 0;
  _$jscoverage['/lang/escape.js'].lineData[172] = 0;
  _$jscoverage['/lang/escape.js'].lineData[174] = 0;
  _$jscoverage['/lang/escape.js'].lineData[175] = 0;
  _$jscoverage['/lang/escape.js'].lineData[178] = 0;
  _$jscoverage['/lang/escape.js'].lineData[179] = 0;
  _$jscoverage['/lang/escape.js'].lineData[180] = 0;
  _$jscoverage['/lang/escape.js'].lineData[181] = 0;
  _$jscoverage['/lang/escape.js'].lineData[183] = 0;
  _$jscoverage['/lang/escape.js'].lineData[186] = 0;
  _$jscoverage['/lang/escape.js'].lineData[187] = 0;
  _$jscoverage['/lang/escape.js'].lineData[188] = 0;
  _$jscoverage['/lang/escape.js'].lineData[189] = 0;
  _$jscoverage['/lang/escape.js'].lineData[190] = 0;
  _$jscoverage['/lang/escape.js'].lineData[191] = 0;
  _$jscoverage['/lang/escape.js'].lineData[192] = 0;
  _$jscoverage['/lang/escape.js'].lineData[194] = 0;
  _$jscoverage['/lang/escape.js'].lineData[201] = 0;
  _$jscoverage['/lang/escape.js'].lineData[202] = 0;
  _$jscoverage['/lang/escape.js'].lineData[221] = 0;
  _$jscoverage['/lang/escape.js'].lineData[222] = 0;
  _$jscoverage['/lang/escape.js'].lineData[224] = 0;
  _$jscoverage['/lang/escape.js'].lineData[225] = 0;
  _$jscoverage['/lang/escape.js'].lineData[226] = 0;
  _$jscoverage['/lang/escape.js'].lineData[233] = 0;
  _$jscoverage['/lang/escape.js'].lineData[234] = 0;
  _$jscoverage['/lang/escape.js'].lineData[235] = 0;
  _$jscoverage['/lang/escape.js'].lineData[236] = 0;
  _$jscoverage['/lang/escape.js'].lineData[237] = 0;
  _$jscoverage['/lang/escape.js'].lineData[240] = 0;
  _$jscoverage['/lang/escape.js'].lineData[241] = 0;
  _$jscoverage['/lang/escape.js'].lineData[242] = 0;
  _$jscoverage['/lang/escape.js'].lineData[243] = 0;
  _$jscoverage['/lang/escape.js'].lineData[245] = 0;
  _$jscoverage['/lang/escape.js'].lineData[246] = 0;
  _$jscoverage['/lang/escape.js'].lineData[248] = 0;
  _$jscoverage['/lang/escape.js'].lineData[249] = 0;
  _$jscoverage['/lang/escape.js'].lineData[252] = 0;
  _$jscoverage['/lang/escape.js'].lineData[253] = 0;
  _$jscoverage['/lang/escape.js'].lineData[254] = 0;
  _$jscoverage['/lang/escape.js'].lineData[256] = 0;
  _$jscoverage['/lang/escape.js'].lineData[259] = 0;
  _$jscoverage['/lang/escape.js'].lineData[262] = 0;
  _$jscoverage['/lang/escape.js'].lineData[266] = 0;
  _$jscoverage['/lang/escape.js'].lineData[267] = 0;
}
if (! _$jscoverage['/lang/escape.js'].functionData) {
  _$jscoverage['/lang/escape.js'].functionData = [];
  _$jscoverage['/lang/escape.js'].functionData[0] = 0;
  _$jscoverage['/lang/escape.js'].functionData[1] = 0;
  _$jscoverage['/lang/escape.js'].functionData[2] = 0;
  _$jscoverage['/lang/escape.js'].functionData[3] = 0;
  _$jscoverage['/lang/escape.js'].functionData[4] = 0;
  _$jscoverage['/lang/escape.js'].functionData[5] = 0;
  _$jscoverage['/lang/escape.js'].functionData[6] = 0;
  _$jscoverage['/lang/escape.js'].functionData[7] = 0;
  _$jscoverage['/lang/escape.js'].functionData[8] = 0;
  _$jscoverage['/lang/escape.js'].functionData[9] = 0;
  _$jscoverage['/lang/escape.js'].functionData[10] = 0;
  _$jscoverage['/lang/escape.js'].functionData[11] = 0;
  _$jscoverage['/lang/escape.js'].functionData[12] = 0;
  _$jscoverage['/lang/escape.js'].functionData[13] = 0;
  _$jscoverage['/lang/escape.js'].functionData[14] = 0;
  _$jscoverage['/lang/escape.js'].functionData[15] = 0;
  _$jscoverage['/lang/escape.js'].functionData[16] = 0;
  _$jscoverage['/lang/escape.js'].functionData[17] = 0;
}
if (! _$jscoverage['/lang/escape.js'].branchData) {
  _$jscoverage['/lang/escape.js'].branchData = {};
  _$jscoverage['/lang/escape.js'].branchData['44'] = [];
  _$jscoverage['/lang/escape.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['44'][3] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['44'][4] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['44'][5] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['48'] = [];
  _$jscoverage['/lang/escape.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['60'] = [];
  _$jscoverage['/lang/escape.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['143'] = [];
  _$jscoverage['/lang/escape.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['165'] = [];
  _$jscoverage['/lang/escape.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['166'] = [];
  _$jscoverage['/lang/escape.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['167'] = [];
  _$jscoverage['/lang/escape.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['178'] = [];
  _$jscoverage['/lang/escape.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['180'] = [];
  _$jscoverage['/lang/escape.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['186'] = [];
  _$jscoverage['/lang/escape.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['187'] = [];
  _$jscoverage['/lang/escape.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['189'] = [];
  _$jscoverage['/lang/escape.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['191'] = [];
  _$jscoverage['/lang/escape.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['221'] = [];
  _$jscoverage['/lang/escape.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['224'] = [];
  _$jscoverage['/lang/escape.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['225'] = [];
  _$jscoverage['/lang/escape.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['233'] = [];
  _$jscoverage['/lang/escape.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['235'] = [];
  _$jscoverage['/lang/escape.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['248'] = [];
  _$jscoverage['/lang/escape.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['252'] = [];
  _$jscoverage['/lang/escape.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/lang/escape.js'].branchData['253'] = [];
  _$jscoverage['/lang/escape.js'].branchData['253'][1] = new BranchData();
}
_$jscoverage['/lang/escape.js'].branchData['253'][1].init(25, 19, 'S.isArray(ret[key])');
function visit148_253_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['252'][1].init(778, 10, 'key in ret');
function visit147_252_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['248'][1].init(438, 21, 'S.endsWith(key, \'[]\')');
function visit146_248_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['235'][1].init(69, 13, 'eqIndex == -1');
function visit145_235_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['233'][1].init(383, 7, 'i < len');
function visit144_233_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['225'][1].init(155, 8, 'eq || EQ');
function visit143_225_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['224'][1].init(126, 10, 'sep || SEP');
function visit142_224_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['221'][2].init(17, 22, 'typeof str != \'string\'');
function visit141_221_2(result) {
  _$jscoverage['/lang/escape.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['221'][1].init(17, 46, 'typeof str != \'string\' || !(str = S.trim(str))');
function visit140_221_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['191'][1].init(117, 15, 'v !== undefined');
function visit139_191_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['189'][1].init(65, 20, 'isValidParamValue(v)');
function visit138_189_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['187'][1].init(51, 7, 'i < len');
function visit137_187_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['186'][1].init(444, 28, 'S.isArray(val) && val.length');
function visit136_186_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['180'][1].init(60, 17, 'val !== undefined');
function visit135_180_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['178'][1].init(136, 22, 'isValidParamValue(val)');
function visit134_178_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['167'][1].init(74, 28, 'serializeArray === undefined');
function visit133_167_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['166'][1].init(48, 8, 'eq || EQ');
function visit132_166_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['165'][1].init(19, 10, 'sep || SEP');
function visit131_165_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['143'][1].init(24, 42, 'htmlEntities[m] || String.fromCharCode(+n)');
function visit130_143_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['60'][1].init(13, 11, 'unEscapeReg');
function visit129_60_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['48'][1].init(13, 9, 'escapeReg');
function visit128_48_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['44'][5].init(166, 16, 't !== \'function\'');
function visit127_44_5(result) {
  _$jscoverage['/lang/escape.js'].branchData['44'][5].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['44'][4].init(148, 14, 't !== \'object\'');
function visit126_44_4(result) {
  _$jscoverage['/lang/escape.js'].branchData['44'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['44'][3].init(148, 34, 't !== \'object\' && t !== \'function\'');
function visit125_44_3(result) {
  _$jscoverage['/lang/escape.js'].branchData['44'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['44'][2].init(132, 11, 'val == null');
function visit124_44_2(result) {
  _$jscoverage['/lang/escape.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].branchData['44'][1].init(132, 51, 'val == null || (t !== \'object\' && t !== \'function\')');
function visit123_44_1(result) {
  _$jscoverage['/lang/escape.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/escape.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/escape.js'].functionData[0]++;
  _$jscoverage['/lang/escape.js'].lineData[11]++;
  var logger = S.getLogger('s/lang');
  _$jscoverage['/lang/escape.js'].lineData[12]++;
  var SEP = '&', EMPTY = '', EQ = '=', TRUE = true, HEX_BASE = 16, htmlEntities = {
  '&amp;': '&', 
  '&gt;': '>', 
  '&lt;': '<', 
  '&#x60;': '`', 
  '&#x2F;': '/', 
  '&quot;': '"', 
  '&#x27;': "'"}, reverseEntities = {}, escapeReg, unEscapeReg, escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
  _$jscoverage['/lang/escape.js'].lineData[35]++;
  (function() {
  _$jscoverage['/lang/escape.js'].functionData[1]++;
  _$jscoverage['/lang/escape.js'].lineData[36]++;
  for (var k in htmlEntities) {
    _$jscoverage['/lang/escape.js'].lineData[37]++;
    reverseEntities[htmlEntities[k]] = k;
  }
})();
  _$jscoverage['/lang/escape.js'].lineData[41]++;
  function isValidParamValue(val) {
    _$jscoverage['/lang/escape.js'].functionData[2]++;
    _$jscoverage['/lang/escape.js'].lineData[42]++;
    var t = typeof val;
    _$jscoverage['/lang/escape.js'].lineData[44]++;
    return visit123_44_1(visit124_44_2(val == null) || (visit125_44_3(visit126_44_4(t !== 'object') && visit127_44_5(t !== 'function'))));
  }
  _$jscoverage['/lang/escape.js'].lineData[47]++;
  function getEscapeReg() {
    _$jscoverage['/lang/escape.js'].functionData[3]++;
    _$jscoverage['/lang/escape.js'].lineData[48]++;
    if (visit128_48_1(escapeReg)) {
      _$jscoverage['/lang/escape.js'].lineData[49]++;
      return escapeReg;
    }
    _$jscoverage['/lang/escape.js'].lineData[51]++;
    var str = EMPTY;
    _$jscoverage['/lang/escape.js'].lineData[52]++;
    S.each(htmlEntities, function(entity) {
  _$jscoverage['/lang/escape.js'].functionData[4]++;
  _$jscoverage['/lang/escape.js'].lineData[53]++;
  str += entity + '|';
});
    _$jscoverage['/lang/escape.js'].lineData[55]++;
    str = str.slice(0, -1);
    _$jscoverage['/lang/escape.js'].lineData[56]++;
    return escapeReg = new RegExp(str, 'g');
  }
  _$jscoverage['/lang/escape.js'].lineData[59]++;
  function getUnEscapeReg() {
    _$jscoverage['/lang/escape.js'].functionData[5]++;
    _$jscoverage['/lang/escape.js'].lineData[60]++;
    if (visit129_60_1(unEscapeReg)) {
      _$jscoverage['/lang/escape.js'].lineData[61]++;
      return unEscapeReg;
    }
    _$jscoverage['/lang/escape.js'].lineData[63]++;
    var str = EMPTY;
    _$jscoverage['/lang/escape.js'].lineData[64]++;
    S.each(reverseEntities, function(entity) {
  _$jscoverage['/lang/escape.js'].functionData[6]++;
  _$jscoverage['/lang/escape.js'].lineData[65]++;
  str += entity + '|';
});
    _$jscoverage['/lang/escape.js'].lineData[67]++;
    str += '&#(\\d{1,5});';
    _$jscoverage['/lang/escape.js'].lineData[68]++;
    return unEscapeReg = new RegExp(str, 'g');
  }
  _$jscoverage['/lang/escape.js'].lineData[71]++;
  S.mix(S, {
  urlEncode: function(s) {
  _$jscoverage['/lang/escape.js'].functionData[7]++;
  _$jscoverage['/lang/escape.js'].lineData[80]++;
  return encodeURIComponent(String(s));
}, 
  urlDecode: function(s) {
  _$jscoverage['/lang/escape.js'].functionData[8]++;
  _$jscoverage['/lang/escape.js'].lineData[91]++;
  return decodeURIComponent(s.replace(/\+/g, ' '));
}, 
  fromUnicode: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[9]++;
  _$jscoverage['/lang/escape.js'].lineData[100]++;
  return str.replace(/\\u([a-f\d]{4})/ig, function(m, u) {
  _$jscoverage['/lang/escape.js'].functionData[10]++;
  _$jscoverage['/lang/escape.js'].lineData[101]++;
  return String.fromCharCode(parseInt(u, HEX_BASE));
});
}, 
  escapeHtml: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[11]++;
  _$jscoverage['/lang/escape.js'].lineData[118]++;
  return (str + '').replace(getEscapeReg(), function(m) {
  _$jscoverage['/lang/escape.js'].functionData[12]++;
  _$jscoverage['/lang/escape.js'].lineData[119]++;
  return reverseEntities[m];
});
}, 
  escapeRegExp: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[13]++;
  _$jscoverage['/lang/escape.js'].lineData[130]++;
  return str.replace(escapeRegExp, '\\$&');
}, 
  unEscapeHtml: function(str) {
  _$jscoverage['/lang/escape.js'].functionData[14]++;
  _$jscoverage['/lang/escape.js'].lineData[142]++;
  return str.replace(getUnEscapeReg(), function(m, n) {
  _$jscoverage['/lang/escape.js'].functionData[15]++;
  _$jscoverage['/lang/escape.js'].lineData[143]++;
  return visit130_143_1(htmlEntities[m] || String.fromCharCode(+n));
});
}, 
  param: function(o, sep, eq, serializeArray) {
  _$jscoverage['/lang/escape.js'].functionData[16]++;
  _$jscoverage['/lang/escape.js'].lineData[165]++;
  sep = visit131_165_1(sep || SEP);
  _$jscoverage['/lang/escape.js'].lineData[166]++;
  eq = visit132_166_1(eq || EQ);
  _$jscoverage['/lang/escape.js'].lineData[167]++;
  if (visit133_167_1(serializeArray === undefined)) {
    _$jscoverage['/lang/escape.js'].lineData[168]++;
    serializeArray = TRUE;
  }
  _$jscoverage['/lang/escape.js'].lineData[170]++;
  var buf = [], key, i, v, len, val, encode = S.urlEncode;
  _$jscoverage['/lang/escape.js'].lineData[172]++;
  for (key in o) {
    _$jscoverage['/lang/escape.js'].lineData[174]++;
    val = o[key];
    _$jscoverage['/lang/escape.js'].lineData[175]++;
    key = encode(key);
    _$jscoverage['/lang/escape.js'].lineData[178]++;
    if (visit134_178_1(isValidParamValue(val))) {
      _$jscoverage['/lang/escape.js'].lineData[179]++;
      buf.push(key);
      _$jscoverage['/lang/escape.js'].lineData[180]++;
      if (visit135_180_1(val !== undefined)) {
        _$jscoverage['/lang/escape.js'].lineData[181]++;
        buf.push(eq, encode(val + EMPTY));
      }
      _$jscoverage['/lang/escape.js'].lineData[183]++;
      buf.push(sep);
    } else {
      _$jscoverage['/lang/escape.js'].lineData[186]++;
      if (visit136_186_1(S.isArray(val) && val.length)) {
        _$jscoverage['/lang/escape.js'].lineData[187]++;
        for (i = 0 , len = val.length; visit137_187_1(i < len); ++i) {
          _$jscoverage['/lang/escape.js'].lineData[188]++;
          v = val[i];
          _$jscoverage['/lang/escape.js'].lineData[189]++;
          if (visit138_189_1(isValidParamValue(v))) {
            _$jscoverage['/lang/escape.js'].lineData[190]++;
            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
            _$jscoverage['/lang/escape.js'].lineData[191]++;
            if (visit139_191_1(v !== undefined)) {
              _$jscoverage['/lang/escape.js'].lineData[192]++;
              buf.push(eq, encode(v + EMPTY));
            }
            _$jscoverage['/lang/escape.js'].lineData[194]++;
            buf.push(sep);
          }
        }
      }
    }
  }
  _$jscoverage['/lang/escape.js'].lineData[201]++;
  buf.pop();
  _$jscoverage['/lang/escape.js'].lineData[202]++;
  return buf.join(EMPTY);
}, 
  unparam: function(str, sep, eq) {
  _$jscoverage['/lang/escape.js'].functionData[17]++;
  _$jscoverage['/lang/escape.js'].lineData[221]++;
  if (visit140_221_1(visit141_221_2(typeof str != 'string') || !(str = S.trim(str)))) {
    _$jscoverage['/lang/escape.js'].lineData[222]++;
    return {};
  }
  _$jscoverage['/lang/escape.js'].lineData[224]++;
  sep = visit142_224_1(sep || SEP);
  _$jscoverage['/lang/escape.js'].lineData[225]++;
  eq = visit143_225_1(eq || EQ);
  _$jscoverage['/lang/escape.js'].lineData[226]++;
  var ret = {}, eqIndex, decode = S.urlDecode, pairs = str.split(sep), key, val, i = 0, len = pairs.length;
  _$jscoverage['/lang/escape.js'].lineData[233]++;
  for (; visit144_233_1(i < len); ++i) {
    _$jscoverage['/lang/escape.js'].lineData[234]++;
    eqIndex = pairs[i].indexOf(eq);
    _$jscoverage['/lang/escape.js'].lineData[235]++;
    if (visit145_235_1(eqIndex == -1)) {
      _$jscoverage['/lang/escape.js'].lineData[236]++;
      key = decode(pairs[i]);
      _$jscoverage['/lang/escape.js'].lineData[237]++;
      val = undefined;
    } else {
      _$jscoverage['/lang/escape.js'].lineData[240]++;
      key = decode(pairs[i].substring(0, eqIndex));
      _$jscoverage['/lang/escape.js'].lineData[241]++;
      val = pairs[i].substring(eqIndex + 1);
      _$jscoverage['/lang/escape.js'].lineData[242]++;
      try {
        _$jscoverage['/lang/escape.js'].lineData[243]++;
        val = decode(val);
      }      catch (e) {
  _$jscoverage['/lang/escape.js'].lineData[245]++;
  logger.error('decodeURIComponent error : ' + val);
  _$jscoverage['/lang/escape.js'].lineData[246]++;
  logger.error(e);
}
      _$jscoverage['/lang/escape.js'].lineData[248]++;
      if (visit146_248_1(S.endsWith(key, '[]'))) {
        _$jscoverage['/lang/escape.js'].lineData[249]++;
        key = key.substring(0, key.length - 2);
      }
    }
    _$jscoverage['/lang/escape.js'].lineData[252]++;
    if (visit147_252_1(key in ret)) {
      _$jscoverage['/lang/escape.js'].lineData[253]++;
      if (visit148_253_1(S.isArray(ret[key]))) {
        _$jscoverage['/lang/escape.js'].lineData[254]++;
        ret[key].push(val);
      } else {
        _$jscoverage['/lang/escape.js'].lineData[256]++;
        ret[key] = [ret[key], val];
      }
    } else {
      _$jscoverage['/lang/escape.js'].lineData[259]++;
      ret[key] = val;
    }
  }
  _$jscoverage['/lang/escape.js'].lineData[262]++;
  return ret;
}});
  _$jscoverage['/lang/escape.js'].lineData[266]++;
  S.escapeHTML = S.escapeHtml;
  _$jscoverage['/lang/escape.js'].lineData[267]++;
  S.unEscapeHTML = S.unEscapeHtml;
})(KISSY);
