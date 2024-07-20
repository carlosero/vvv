const config = require("./config");
const data = require("./data");
const dictionary = require("./dictionary");

const userUnlocks = Object.values(data.unlocks);
const configUnlocks = Object.values(config.unlocks);

// user unlock format
// "unlocks": {
//       "1": {
//           "count": 14,
//           "unlock_id": 1,
//           "last_update": 1721446996,
//           "next_unlock_in": 0
//       },

// config unlock format
// "unlocks": {
//       "1": {
//           "id": 1,
//           "max_count": 30,
//           "required_id": 0,
//           "required_count": 0,
//           "unlock_time": {
//               "amount": 0
//           },
//           "type": "Valiants",
//           "prices": [
//               100,
//               129,
//							 ...
//           ],
//           "experiences": [
//               50,
//               110,
//               ...
//           ]
//       },

const getDict = (unlock_id) => {
  return dictionary.types.find((dictType) => dictType.unlock_id === unlock_id);
};

// OK, we need basically a table to compare user unlocks with current exp requirement and reward to know the best % to get and tell user
// table: unlock_id, current_level, exp_required, exp_reward, percentage;
let table = [];
for (let i = 0; i < configUnlocks.length; i++) {
  let configUnlock = configUnlocks[i];
  console.log("configUnlock:", configUnlock);
  let userUnlock = userUnlocks.find(
    (userUnlock) => userUnlock.unlock_id === configUnlock.id
  );

  let current_level = userUnlock?.count || 0;
  let exp_required = configUnlock.prices[current_level];
  let exp_reward = configUnlock.experiences[current_level];
  let percentage = (exp_reward / exp_required) * 100;
  let configUnlockDict = getDict(configUnlock.id);
  let requiredDict =
    configUnlock.required_id > 0 ? getDict(configUnlock.required_id) : null;
  table.push({
    object:
      configUnlockDict.unlock_id +
      " - " +
      configUnlockDict.name +
      " - " +
      configUnlockDict.type,
    requires: requiredDict
      ? requiredDict.name +
        " - " +
        requiredDict.type +
        " - " +
        configUnlock.required_count
      : "--",
    current_level: current_level,
    exp_required: exp_required,
    exp_reward: exp_reward,
    percentage: percentage,
  });
}

console.table(table.sort((a, b) => b.percentage - a.percentage));
