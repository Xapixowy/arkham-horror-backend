export type Equipment = {
  money: number;
  clues: number;
  random: {
    common_items: number;
    unique_items: number;
    spells: number;
    abilities: number;
    allies: number;
  };
  static: number[];
};
