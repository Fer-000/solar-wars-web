import ground from "./ground"
import infantry from "./infantry"
import missile from "./missile"
import ship from "./ship"

export type RaterItem = {
    rater: {
        rate: any,
        params: any,
    },
    label: string
}

export const raters = {
  ground: {rater: ground, label: "Ground Rater"},
  shipRate: {rater: ship, label: "Ship Rater"},
  missileRate: {rater: missile, label: "Missile Rater"},
  infantryRate: {rater: infantry, label: "Infantry Rater"}
}