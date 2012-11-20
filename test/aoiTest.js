var aoiService = require('../lib/aoiService');
var config;

function initAoi(){
  config = {
    map:{
      width: 10000,
      height: 10000,
      id: 1001
    },
    tower:{
      width: 100,
      height: 100
    }
  }
  
  return aoiService.getService(config);
}

var users;

function testCase(){
  var aoi = initAoi();
  var w = config.map.width;
  var h = config.map.height;
  
  
  var count = 5000;
  users = {};
  var id = 0;
  var types = ['player', 'mob', 'npc'];
  
  for(var i = 0; i < count; i++, id++){
    users[id] = {
      id: id,
      pos : {
        x : Math.floor(Math.random()*w),
        y : Math.floor(Math.random()*h)
      },
      type: types[i%3]
    }  
  }
  
  for(var id in users){
    aoi.addObject(users[id], users[id].pos)
  }
  
  testPos(users, w, h, aoi, types);
  //testPath(users, w, h, aoi);
}

function testPath(users, w, h, aoi){
  var testCount = 100;
  var testPath = [];
  var width = config.map.width;
  var height = config.map.height;
  
  //The max move distance
  var max = 600;
  var direction = 1;
  for (var i = 0; i < testCount; i++){
    var start = {
      x: Math.floor(Math.random()*w),
      y : Math.floor(Math.random()*h)
    };
    
    //Éú³ÉÐéÄâÒÆ¶¯
    
    var dis = Math.floor(Math.random()*max);
    direction = Math.random>0.5?-1:1
    var xMove = Math.floor(Math.random()*dis) * direction;
    direction = Math.random>0.5?-1:1
    var yMove = Math.floor(Math.sqrt(dis*dis - xMove*xMove)) * direction;
    direction *= -1;
    
    
    var x = start.x + xMove;
    var y = start.y + yMove;
    x = x<0?0:x>width?width:x;
    y = y<0?0:y>height?height:y; 
    
    var end = {
      x: x,
      y: y
    }
    
    testPath.push([start, end]);
  }
  
  var avg = 0;
  for(var i = 0; i < testCount; i++){
    //aoi.updateObject(10, testPath[i][0], testPath[i][1]);
    var ids1 = aoi.getIdsByPath(testPath[i][0], testPath[i][1]).sort(sort);
    var ids2 = getRightArrByPath(testPath[i], users)
    
    
    
    if(!equals(ids1, ids2)){
      console.error('test case error, path : ' + JSON.stringify(testPath[i]));
      console.error(ids1.length);
      console.error(ids2.length);
      printUsers(ids1, users);
      printUsers(ids2, users);
      console.error(ids1.towers);
      break;
    }
    
    avg += (ids1.length -avg)/(i+1);
  }
  
  console.error(avg);  
}

function testPos(users, w, h, aoi, types){
  var testCount = 100;
  var testPos = [];
  for (var i = 0; i < testCount; i++){
    testPos.push({
      x: Math.floor(Math.random()*w),
      y : Math.floor(Math.random()*h)
    });
  }
  
  var avg = 0;
  var range = 3;
  for(var i = 0; i < testCount; i++){
    var ids1 = aoi.getIdsByRange(testPos[i], range, types);
    
    for(var type in ids1)
      ids1[type].sort(sort); 
    var ids2 = getRightArrByPos(testPos[i], users, range, types)
    
    //console.error(ids1);
    //console.error(ids2);
    if(!mapEquals(ids1, ids2, types)){
      //console.error(users);
      console.error('test case error');
      console.error(ids1);
      console.error(ids2);
      
      break;
    }
    
    //avg += (ids1.length -avg)/(i+1);
  }
  
  //console.error(avg);
}

function getRightArrByPos(pos, users, range, types){
  var result = {};
  var w = config.tower.width;
  var h = config.tower.height;
  
  var x = Math.floor(pos.x/w) * w;
  var y = Math.floor(pos.y/h) * h;
  
  var x1 = x - w*range, x2 = x + w*(range+1);
  var y1 = y - h*range, y2 = y + h*(range+1);
  
  //console.error('x1 : ' + x1 + ' , x2 : ' + x2 + ' , y1 : ' + y1 + ' , y2 : ' + y2)
  
  for(var id in users){
    var pos = users[id].pos;
    var type = users[id].type;
    if(pos.x >= x1 && pos.x < x2 && pos.y >= y1 && pos.y < y2){
      //result.push(id);
      if(!result[type])
        result[type] = [];
        
      result[type].push(users[id].id);
    }
  }
  
  for(var type in result){
    result[type].sort(sort);
  }
  return result;
}

function getRightArrByPath(path, users){
  var result = [];
  var w = config.tower.width;
  var h = config.tower.height;
  
  var p1 = path[0], p2 = path[1];
  
  var x1 = Math.floor((p1.x<p2.x?p1.x:p2.x)/w) * w - w;
  var y1 = Math.floor((p1.y<p2.y?p1.y:p2.y)/h) * h - h;
  
  var x2 = Math.floor((p1.x>p2.x?p1.x:p2.x)/w) * w + w + w;
  var y2 = Math.floor((p1.y>p2.y?p1.y:p2.y)/h) * h + h + h;
  
  //console.error('x1 : ' + x1 + ' , x2 : ' + x2 + ' , y1 : ' + y1 + ' , y2 : ' + y2)
  
  for(var id in users){
    var pos = users[id].pos;
    if(pos.x >= x1 && pos.x < x2 && pos.y >= y1 && pos.y < y2){
      result.push(id);
    }
  }
  return result.sort(sort);
}

function sort(a, b){
  return a - b;
}

function arrayEquals(arr1, arr2){
  if(arr1.length != arr2.length){
    return false;
  }
    
  for(var i = 0; i < arr1.length; i++){
    if(arr1[i] != arr2[i])
      return false;
  }
  
  return true;
  
}

function mapEquals(map1, map2, keys){
  for(var i = 0; i < keys.length; i++){
    var key = keys[i];
    
    if(!map1[key] && !map2[key])
      continue;
    if(!map1[key] || !map2[key])
      return false;
    
    if(!arrayEquals(map1[key], map2[key])){
      return false;  
    }
  }
  
  return true;
}

function printUsers(uids, users){
  for(var key in uids){
    var uid = uids[key];
    console.log(users[uid]);
  }
}
testCase();
