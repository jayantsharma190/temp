(function euler002() {
  var fib = [1, 2];
  var sum = 0;

  function calc(arr) {
    return arr[arr.length - 1] + arr[arr.length - 2];
  }

  while (fib[fib.length - 1] < 4e+6) {
    fib.push(calc(fib));
  }

  fib.forEach(function (n) {
    if (n % 2 === 0) {
      sum += n;
    }
  });

  console.log(sum);
  return sum;
}());