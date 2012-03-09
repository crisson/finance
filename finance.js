/*
 * @namespace for calculating various financial metrics
 * @requires the underscore library
 * @author Crisson Jno-Charles
 */
var Finance = (function(Finance){
  var fin = Finance || {};
  
  function DependencyError(message){
    this.name = 'DependencyError';
    this.message = message || 'A required dependency was not found';
  }
  
  DependencyError.prototype = new Error();
  DependencyError.prototype.constructor = DependencyError;
  
  function guess_fx(guess, ar){
    var arry = [];
    _.map(ar, function(val, ind){
      arry.push({ind : val});  
    });
    return ar.reduce(function(prev, curr, ind, arry){
      if (ind === 0){
          return prev + curr; 
      } else {
          var calc = curr*Math.pow(1+guess, -ind);
          return prev + calc; 
      }         
    }, 0);    
  }; 
  
  
  function guess_prime_fx(guess, ar) {
    var output = ar.reduce(function(prev, curr, ind){
        if (ind === 0){
            return prev;
        } else {
            return prev + (-ind)*curr*Math.pow(1+guess, -ind -1);            
        }
    }, 0);
    return output;
  }  
  
  
  fin.irr = function irr(initial_guess, arry) {
   var rate = initial_guess;
   var itererations_limit = 1000;
   var iterations = 0;
   var err = .01;
      while (err > .000001 && iterations < iterations_limit){
        var fx = guess_fx(rate, arry),
          fpx = guess_prime_fx(rate, arry),
          prior_rate = rate;
          
        rate = rate - fx/fpx;
        err = Math.abs(rate - prior_rate);
        iterations++;
      }
      
      if (iterations >= iterations_limit) {
        return Infinity;
      } else {
        return rate;  
      }
  };
  
  fin.pmt = function(principal, interest) {
    var p = principal,
      i = interest,
      n = 12*30; // 12 months per year for 30 years

    p = p < 0 ? Math.abs(p) : p;  
    return p * (i*Math.pow(1+i, n))/(Math.pow(1+i, n) - 1);
  };
  
  
  /*
   * Calculates the amortized value of a loan over a particular
   * period of time
   * 
   * @this {Finance}
   * @param {number} loan_amount the loan amount.
   * @param {decimal} interest the interest amount, compounded annually (e.g., .04).
   * @param {number} period the period over which the amortization schedule should
   * be calculated
   * @return the amortized value of the loan_amount, as of the start of the month following
   * the period
   * 
   * @example
   * Finance.amort(-180000, .04, 36) = -170097.70
   */
  fin.amort = function(loan_amount, interest, period){
    var periods = _.range(period);
    var pmt = fin.pmt(loan_amount, interest/12);
    period--;
    
    function loan_outstanding(la, inte){
      var ip = -la*inte/12, // interest payment
        pd = pmt - ip, // principal paydown
        newla = la + pd; // new loan amount
        
      if (period <= 0) {
        return newla;
      } else {
        period--;
        return loan_outstanding(newla, interest);
      }
    }
    
    return loan_outstanding(loan_amount, interest);  
  }
  
  fin.amort_with_dp = function(mortgage, downpayment, interest, period){}
  
  /*
   * Calculates the value of a European style put/call option
   *
   * @this {Finance}
   * @param {number} stock_price the stock price
   * @param {number} strike the strike price of the option
   * @param {decimal} risk_free the risk free rate of return (annual rate, continuous compounding)
   * @param {number} volatility the historical volatility of of the stock
   * @param {number} the time to maturity in years 
   */
  fin.blackscholes = function(stock_price, strike, risk_free, volatility, time){
    if (!fin.inputs.cdf) {
      throw new DependencyError('This function requires the continuous' + 
      ' distribution function fin.input.cdf to operate');
    }  
    
    console.log(Math.log(stock_price/strike));
    var d0 = (Math.log(stock_price/strike) + (risk_free + 
      (Math.pow(volatility, 2)/2))*time) /
      (volatility*Math.sqrt(time));
      
    console.log(d0);
    var std_normal = fin.inputs.stdnormal(d0);
    console.log(std_normal);
    
    var Nd0 = fin.inputs.cdf([0],[std_normal]);
    console.log(Nd0);
  };
  
  return fin; 
})(Finance);