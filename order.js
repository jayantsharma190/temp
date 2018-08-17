let orderCount = 0;

const takeOrder = (topping, crustType) => {
  orderCount++;
  console.log('Order: ' + crustType + ' pizza topped with ' + topping);
};

takeOrder('mushroom', 'thin crust');
takeOrder('spinach', 'whole wheat');
takeOrder('pepperoni', 'brooklyn style');

const getSubTotal = (orderCount) => {
  return orderCount * 7.5;
};

const getTax = (orderCount) => {
  return getSubTotal(orderCount) * 0.06
}

const getTotal = (orderCount) => {
  return getTax(orderCount) + getSubTotal(orderCount)
}

console.log(getSubTotal(orderCount));

console.log(getTotal(orderCount))