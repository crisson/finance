
/*
 * @namespace for calculating various financial metrics
 * @requires the underscore library
 * @author Crisson Jno-Charles
 */
var finance = (function(){
  var fin = {};
  
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
   var iterations = 0;
   var err = .01;
      while (err > .000001 && iterations < 100){
        var fx = guess_fx(rate, arry),
          fpx = guess_prime_fx(rate, arry),
          prior_rate = rate;
          
        rate = rate - fx/fpx;
        err = rate - prior_rate;
        iterations++;
      }
      
      if (iterations >= 100) {
        console.log('too many iterations');
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
   * Calculates an amortized value of a loan
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
    var pmt = finance.pmt(loan_amount, interest/12);
    period--;
    
    function loan_outstanding(la, inte){
      var ip = -la*inte/12, // interest payment
        pd = pmt - ip, // principal paydown
        newla = la + pd;
        
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
  return fin; 
})();