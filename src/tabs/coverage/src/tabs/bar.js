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
if (! _$jscoverage['/tabs/bar.js']) {
  _$jscoverage['/tabs/bar.js'] = {};
  _$jscoverage['/tabs/bar.js'].lineData = [];
  _$jscoverage['/tabs/bar.js'].lineData[6] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[7] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[13] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[15] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[19] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[20] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[21] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[22] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[28] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[30] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[31] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[32] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[33] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[35] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[40] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[41] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[42] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[43] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[44] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[46] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[47] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[52] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[53] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[54] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[55] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[57] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[62] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[63] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[64] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[65] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[89] = 0;
  _$jscoverage['/tabs/bar.js'].lineData[100] = 0;
}
if (! _$jscoverage['/tabs/bar.js'].functionData) {
  _$jscoverage['/tabs/bar.js'].functionData = [];
  _$jscoverage['/tabs/bar.js'].functionData[0] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[1] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[2] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[3] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[4] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[5] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[6] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[7] = 0;
  _$jscoverage['/tabs/bar.js'].functionData[8] = 0;
}
if (! _$jscoverage['/tabs/bar.js'].branchData) {
  _$jscoverage['/tabs/bar.js'].branchData = {};
  _$jscoverage['/tabs/bar.js'].branchData['21'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['31'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['43'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['53'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['54'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/tabs/bar.js'].branchData['64'] = [];
  _$jscoverage['/tabs/bar.js'].branchData['64'][1] = new BranchData();
}
_$jscoverage['/tabs/bar.js'].branchData['64'][1].init(80, 34, 'self.get(\'changeType\') === \'mouse\'');
function visit6_64_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['54'][1].init(21, 23, 'e && (prev = e.prevVal)');
function visit5_54_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['53'][1].init(39, 1, 'v');
function visit4_53_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['43'][1].init(159, 25, 'typeof next === \'boolean\'');
function visit3_43_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['31'][1].init(21, 17, 'c.get(\'selected\')');
function visit2_31_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].branchData['21'][1].init(21, 30, 'e.newVal && e.target.isTabsTab');
function visit1_21_1(result) {
  _$jscoverage['/tabs/bar.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/bar.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tabs/bar.js'].functionData[0]++;
  _$jscoverage['/tabs/bar.js'].lineData[7]++;
  var Toolbar = require('toolbar');
  _$jscoverage['/tabs/bar.js'].lineData[13]++;
  var TabBar = Toolbar.extend({
  beforeCreateDom: function(renderData) {
  _$jscoverage['/tabs/bar.js'].functionData[1]++;
  _$jscoverage['/tabs/bar.js'].lineData[15]++;
  renderData.elAttrs.role = 'tablist';
}, 
  bindUI: function() {
  _$jscoverage['/tabs/bar.js'].functionData[2]++;
  _$jscoverage['/tabs/bar.js'].lineData[19]++;
  var self = this;
  _$jscoverage['/tabs/bar.js'].lineData[20]++;
  self.on('afterSelectedChange', function(e) {
  _$jscoverage['/tabs/bar.js'].functionData[3]++;
  _$jscoverage['/tabs/bar.js'].lineData[21]++;
  if (visit1_21_1(e.newVal && e.target.isTabsTab)) {
    _$jscoverage['/tabs/bar.js'].lineData[22]++;
    self.set('selectedTab', e.target);
  }
});
}, 
  syncUI: function() {
  _$jscoverage['/tabs/bar.js'].functionData[4]++;
  _$jscoverage['/tabs/bar.js'].lineData[28]++;
  var self = this, children = self.get('children');
  _$jscoverage['/tabs/bar.js'].lineData[30]++;
  S.each(children, function(c) {
  _$jscoverage['/tabs/bar.js'].functionData[5]++;
  _$jscoverage['/tabs/bar.js'].lineData[31]++;
  if (visit2_31_1(c.get('selected'))) {
    _$jscoverage['/tabs/bar.js'].lineData[32]++;
    self.setInternal('selectedTab', c);
    _$jscoverage['/tabs/bar.js'].lineData[33]++;
    return false;
  }
  _$jscoverage['/tabs/bar.js'].lineData[35]++;
  return undefined;
});
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/tabs/bar.js'].functionData[6]++;
  _$jscoverage['/tabs/bar.js'].lineData[40]++;
  var self = this;
  _$jscoverage['/tabs/bar.js'].lineData[41]++;
  var current = self.get('selectedTab');
  _$jscoverage['/tabs/bar.js'].lineData[42]++;
  var next = self.getNextItemByKeyDown(e, current);
  _$jscoverage['/tabs/bar.js'].lineData[43]++;
  if (visit3_43_1(typeof next === 'boolean')) {
    _$jscoverage['/tabs/bar.js'].lineData[44]++;
    return next;
  } else {
    _$jscoverage['/tabs/bar.js'].lineData[46]++;
    next.set('selected', true);
    _$jscoverage['/tabs/bar.js'].lineData[47]++;
    return true;
  }
}, 
  _onSetSelectedTab: function(v, e) {
  _$jscoverage['/tabs/bar.js'].functionData[7]++;
  _$jscoverage['/tabs/bar.js'].lineData[52]++;
  var prev;
  _$jscoverage['/tabs/bar.js'].lineData[53]++;
  if (visit4_53_1(v)) {
    _$jscoverage['/tabs/bar.js'].lineData[54]++;
    if (visit5_54_1(e && (prev = e.prevVal))) {
      _$jscoverage['/tabs/bar.js'].lineData[55]++;
      prev.set('selected', false);
    }
    _$jscoverage['/tabs/bar.js'].lineData[57]++;
    v.set('selected', true);
  }
}, 
  _onSetHighlightedItem: function(v, e) {
  _$jscoverage['/tabs/bar.js'].functionData[8]++;
  _$jscoverage['/tabs/bar.js'].lineData[62]++;
  var self = this;
  _$jscoverage['/tabs/bar.js'].lineData[63]++;
  self.callSuper(v, e);
  _$jscoverage['/tabs/bar.js'].lineData[64]++;
  if (visit6_64_1(self.get('changeType') === 'mouse')) {
    _$jscoverage['/tabs/bar.js'].lineData[65]++;
    self._onSetSelectedTab.apply(self, arguments);
  }
}}, {
  ATTRS: {
  selectedTab: {}, 
  changeType: {
  value: 'click'}, 
  defaultChildCfg: {
  value: {
  xclass: 'tabs-tab'}}}, 
  xclass: 'tabs-bar'});
  _$jscoverage['/tabs/bar.js'].lineData[89]++;
  TabBar.ChangeType = {
  CLICK: 'click', 
  MOUSE: 'mouse'};
  _$jscoverage['/tabs/bar.js'].lineData[100]++;
  return TabBar;
});
