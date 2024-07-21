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
  let userUnlock = userUnlocks.find(
    (userUnlock) => userUnlock.unlock_id === configUnlock.id
  );

  let current_level = userUnlock?.count || 0;
  let exp_required = configUnlock.prices[current_level];
  let exp_reward = configUnlock.experiences[current_level];
  let configUnlockDict = getDict(configUnlock.id);

  let requiredExp = 0;
  let requiredExpPerHour = 0;
  if (configUnlock.required_id > 0) {
    const userUnlockedRequired = userUnlocks.find(
      (usrUnlock) => usrUnlock.unlock_id === configUnlock.required_id
    );
    const unlockRequired = configUnlocks.find(
      (cfgUnlock) => cfgUnlock.id === configUnlock.required_id
    );

    if (
      !userUnlockedRequired ||
      userUnlockedRequired.count < configUnlock.required_count
    ) {
      // sum the total of exp required and exp per hour to get the total exp required
      for (
        let j = userUnlockedRequired?.count || 0;
        j < configUnlock.required_count;
        j++
      ) {
        exp_required += unlockRequired.prices[j];
        exp_reward += unlockRequired.experiences[j];
      }
    }
  }
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
    percentage: (exp_reward / exp_required) * 100,
  });
}

console.table(table.sort((a, b) => b.percentage - a.percentage));
