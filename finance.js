// Open Source Initiative OSI - The MIT License (MIT):Licensing
// 
// The MIT License (MIT)
// Copyright (c) 2012 Crisson Jno-Charles & Alisa Boguslavskaya
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/*jshint trailing:false */

/*
 * @namespace for calculating various financial metrics
 * @requires the underscore library
 * @author Crisson Jno-Charles
 */
var Finance = (function(Finance){
  var fin = Finance || {};
  
  var MONTHS_PER_YEAR = 12;
  
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
  }
  
  
  function guess_prime_fx(guess, ar) {
    return ar.reduce(function(prev, curr, ind){
        if (ind === 0){
            return prev;
        } else {
            return prev + (-ind)*curr*Math.pow(1+guess, -ind -1);            
        }
    }, 0);
  }  
  
  
  fin.irr = function irr(initial_guess, arry) {
   var rate = initial_guess;
   var iterations_limit = 1000;
   var iterations = 0;
   var iter_limit = 1000;
   var err = 0.01;

      while (err > 0.000001 && iterations < iterations_limit){
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
  
  /*
   * Calculates the monthly payment on a loan
   * 
   * @this {Finance}
   * @param {number} principal the amount borrowed
   * @param {decimal} interest the rate of interest on the loan, compounded monthly
   * @param {number=} mortgage_term the time over which the mortgage will be paid
   * back (optional).
   */
  fin.pmt = function(principal, interest, mortgage_term) {
    var p = principal,
      i = interest,
      /*
       * @default 12 months per year for 30 years as default
       * @default 360
       */
      n = mortgage_term ? MONTHS_PER_YEAR * mortgage_term : MONTHS_PER_YEAR * 30; 
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
   * @param {number} years the number years after which the current value of the
   * loan should be calculated
   * @param {Object=} options optional parameters
   *  @param {number=} mortgage_term the mortgage term
   * @return the amortized value of the loan_amount, as of the start of the month following
   * the period
   * 
   * @example
   * Finance.amort(-180000, .04, 3) = -170097.70
   */
  fin.amort = function(loan_amount, interest, year, options){
    options = options || {};
    var period = MONTHS_PER_YEAR * year, 
      periods = _.range(period),
      pmt = fin.pmt(loan_amount, interest/MONTHS_PER_YEAR, 
        options.mortgage_term);
    
    // decrement the number of months by one, such that the loan amount returned
    // is the loan value after the last day of the year after the number of 
    // years specified
    period--;

    function loan_outstanding(la, inte){
      var ip = -la*inte/MONTHS_PER_YEAR, // interest payment
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
  
  fin.amort_with_dp = function(mortgage, downpayment, interest, period){};
  
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
  // fin.blackscholes = function(stock_price, strike, risk_free, volatility, time){
  //   if (!fin.inputs.cdf) {
  //     throw new DependencyError('This function requires the continuous' + 
  //     ' distribution function fin.input.cdf to operate');
  //   }  
    
  //   console.log(Math.log(stock_price/strike));
  //   var d0 = (Math.log(stock_price/strike) + (risk_free + 
  //     (Math.pow(volatility, 2)/2))*time) /
  //     (volatility*Math.sqrt(time));
      
  //   console.log(d0);
  //   var std_normal = fin.inputs.stdnormal(d0);
  //   console.log(std_normal);
    
  //   var Nd0 = fin.inputs.cdf([0],[std_normal]);
  //   console.log(Nd0);
  // };
  
  return fin; 
})(Finance);
