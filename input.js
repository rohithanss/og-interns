const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter something: ", (input) => {
  try {
      input = JSON.parse(input);
  } catch (error) {
    console.log("An error occurred")
    
  }
  console.log(`You entered: ${input}`,input) ;
  rl.close();
});