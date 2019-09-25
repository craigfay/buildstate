export interface Item {
  id: number
  price: number
  name: string
  grams: number
  vendor: string
  labels: Labels
}

export interface Labels {
  [key: string]: string; 
}
