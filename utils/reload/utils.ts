import { clearTimeout } from "timers";

export function debounce<A extends unknown[]>(
  callback: (...args: A) => void,
  delay: number,
) {
  let timer: NodeJS.Timeout;
  return function (...args: A) {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}
/*
This debounce function allows you to control the execution frequency of a function.
Whenever the inner function is called within the specified delay window,
it resets the timer and ensures the callback is called only after the entire delay has passed without any further calls.
This is useful for scenarios where you want to avoid overwhelming the system with too many function calls in rapid succession. 
For example, debouncing can be used to optimize event handlers triggered by user input (like typing in a search bar) 
or image resize events during window resizing.
*/ 