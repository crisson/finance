
var Finance = (function(Finance){
  var fin = Finance || {};
  var inp = {};
  
  /*
   * Cumulative Distribution Function for a discrete distribution of random
   * variables
   * 
   * @this {Finance.input}
   * @param {Array} x an array representing the number of measurements
   * @param {Array} fx an array of the random variables measured
   * @param {Map} options flags 
   * 
   * @throws {TypeError} if x or y is not an Array
   */
  inp.cdf_discrete = function(x, fx, options){
    if (!Array.prototype.reduce){
      console.log('I need to reduce!');
    }
    
    if (!Array.prototype.map){
      console.log('I need a map!');
    }
    
    
    if (!(x instanceof Array)) {
      throw new TypeError('x must be an array');
    } else if (!(fx instanceof Array)){
      throw new TypeError('fx must be an array');
    }
    
    if (x.length !== fx.length){
      throw new RangeError('the errors must be the same length');
    }
    
    var cdf = x.map(function(val, ind, arry){
      var obj = {};
      obj[ind] = fx.reduce(function(prev, cond, indr){
        if (indr <= ind){  
          return prev + cond;
        }
        
        return prev;
      }, 0);
      
      return obj;
    });
    
    if (options && !options.pair) { // return just the values as an array
      return cdf.map(function(pair, ind){
        return pair[ind];
      });
    }
    
    return cdf;
  };
  
  /*
   * Returns pairs of coordinates for the standard normal distribution if the 
   * value provided for x is an Array or object containing the number of pairs
   * that should be returned.  If x is a number, it returns an approximate value
   * of this distribution at that number (i.e., f(x)).
   * 
   * @param {Number or Object} x either the value of this function at this x
   * coordinate, or if it is an object, the number of points in x for which.
   * You may also provide an array of values for which f(x) should be computed
   * f(x) shoule be calculated
   * @param {object} options optional properties
   * 
   * @return {Either[Number, Object]} coordinates if param x is an array or
   * object, otherwise a number
   * 
   * @throws {Error} if an object is passed for x, but it doesn't contain the
   * property range, which indicates the number of values x for which f(x)
   * should be calculated
   * @throws {Error} if an object is passed for x, but the range property
   * provided is less than or equal to zero.
   */
  inp.stdnormal = function(x, options){
    if (typeof x !== 'number' && !(x instanceof Array)) {
      if (!x.range) {
        throw new Error('this is an object, so you must specify the number of' +
        ' points in the domain');
      } else if (x.range && x.range <= 0) {
        throw new Error('the number of data points must be greater than zero');
      }
    }  
    options = options || {};
    var rho_sqr = options.rho_sqr = options.rho_sqr || 1,
      mu = options.mu = options.mu || 0;

    function calculate(x_val){
      return 1/(Math.sqrt(rho_sqr)*Math.sqrt(2 * Math.PI))*Math.pow(Math.E,
       -Math.pow(x_val - mu, 2)/2*rho_sqr);
    }
    
    if (x instanceof Array){
      return x.map(function(val, ind){
        return [ind, calculate(val)];
      });
    } else if (x.range){
      var pairs = [];
      for (var i = 0; i < x.range; i++){
         pairs.push([i, calculate(i)]);
      }
      return pairs;
    } else {
      return calculate(x);
    }
  };
  
  fin.inputs = inp;
  return fin;
}(Finance));