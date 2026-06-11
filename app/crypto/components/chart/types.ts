import { Time } from "lightweight-charts";



export type FibLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  startPrice: number;
  endPrice: number;
};

export type Point = {
  time: number;
  price: number;
};

export type TrendLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  // Optional: keep raw data if needed for recalculations
  start?: { time: any; price: number };
  end?: { time: any; price: number };
};