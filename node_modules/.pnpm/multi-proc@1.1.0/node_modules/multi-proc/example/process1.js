console.log('Process 2 - 0s');
setTimeout(() => {
  console.log('Process 1 - 1s');
}, 1000);
setTimeout(() => {
  console.log('Process 1 - 3s');
}, 3000);
setTimeout(() => {
  console.log('Process 1 - 7s');
}, 7000);
