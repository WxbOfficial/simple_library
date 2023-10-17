import Provider from './provider.js';

/**
 * 将其他进制的数字转换为10进制
 * @param numSys 要准换的进制
 * @param strNum 字符串形式的要转换的数据
 * @returns {number} 整数的十进制数据
 */
function numerationSystemTo10(numSys, strNum){
  let sum = 0;
  for (let i = 0; i < strNum.length; i++) {
    let level = strNum.length - 1 - i;
    let key = parseInt(strNum[i]);
    sum += key * Math.pow(numSys, level);
  }
  return sum;
}
/**
 * 将10进制的数字转换为其他进制
 * @param numSys 要转换成的进制;
 * @param num 要转换的十进制数字
 * @returns {string} 字符串形式的其他进制的数据
 */
function numerationSystemFrom10(numSys, num){
  var tempResultArray = [];
  var quotient = Math.floor(num / numSys);
  var remainder = num % numSys;
  tempResultArray.push(remainder);
  while (quotient !== 0) {
    num = quotient;
    quotient = Math.floor(num / numSys);
    remainder = num % numSys;
    tempResultArray.push(remainder);
  }
  tempResultArray.reverse();
  var strResult = tempResultArray.join("");
  return strResult;
}

/**
* 将数据从一个进制转换到另一个进制，输入和输出都是字符串
* @param numSysFrom
* @param numSysTo
* @param strNumFrom
* @returns {string}
*/
function numerationSystemChange(numSysFrom, numSysTo, strNumFrom){
  var temp10 = numerationSystemTo10(numSysFrom, strNumFrom);
  var strResult = numerationSystemFrom10(numSysTo, temp10);
  return strResult;
}


export default class BingProvider extends Provider{
  getUrl(column, row, level){
    var url = "";
    var tileX = column;
    var tileY = row;
    var strTileX2 = numerationSystemFrom10(2, tileX);
    var strTileY2 = numerationSystemFrom10(2, tileY);
    var delta = strTileX2.length - strTileY2.length;
    var i;
    if (delta > 0) {
      for (i = 0; i < delta; i++) {
        strTileY2 = '0' + strTileY2;
      }
    } else if (delta < 0) {
      delta = -delta;
      for (i = 0; i < delta; i++) {
        strTileX2 = '0' + strTileX2;
      }
    }
    var strMerge2 = "";
    for (i = 0; i < strTileY2.length; i++) {
      var charY = strTileY2[i];
      var charX = strTileX2[i];
      strMerge2 += charY + charX;
    }
    var strMerge4 = numerationSystemChange(2, 4, strMerge2);
    if (strMerge4.length < level) {
      delta = level - strMerge4.length;
      for (i = 0; i < delta; i++) {
        strMerge4 = '0' + strMerge4;
      }
    }
    var sum = level + row + column;
    var serverIdx = sum % 8; //0,1,2,3,4,5,6,7
    url = "http://ecn.t" + serverIdx + ".tiles.virtualearth.net/tiles/h" + strMerge4 + ".jpeg?g=1239&mkt=en-us";
    return url;
	}
  
}