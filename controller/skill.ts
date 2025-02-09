import { actionInterface, effectTypeEnum, targetTypeEnum } from "../interfaces/action.js";
import { instanceInterface } from "../interfaces/instance.js";
import { MonsterFightingInterface } from "../interfaces/monster.js";
import { SkillInterface } from "../interfaces/skill.js";
import { statusName } from "../interfaces/status.js";
import { applyStatus } from "./status.js";

const isSkillHighPriority = (action: actionInterface): boolean => {
    if (action.skill.priority < 50)  return true
    else return false
}

const paySkillCost = (instance: instanceInterface ,monster: MonsterFightingInterface, skill: SkillInterface) => {
    costType()[skill.cost.type](instance, monster, skill.cost.value)
}

const costType = () => {

    const balance = (instance: instanceInterface, monster: MonsterFightingInterface, cost: number) => {}
    const hp = (instance: instanceInterface, monster: MonsterFightingInterface, cost: number) => {}
    const stamina = (instance: instanceInterface, monster: MonsterFightingInterface, cost: number) => {
        monster.stats.stamina -= cost
        if (monster.stats.stamina < 0) {
            monster.stats.hp -= monster.stats.stamina
            monster.stats.stamina = 0
            applyStatus(instance, monster, {
                "targetType": targetTypeEnum.SINGLE,
                "type": effectTypeEnum.STATUS,
                "power": 1,
                "status": statusName.OVERSTAIN
            })
        }
    }
	
    return {balance, hp, stamina}
}

export {
    isSkillHighPriority,
    paySkillCost
}