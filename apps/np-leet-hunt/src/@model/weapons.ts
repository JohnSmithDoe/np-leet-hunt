// type DamageType = 'Physical' | 'Fire' | 'Ice' | 'Lightning';
//
// interface Character {
//     baseDamage: number;
//     armor: number;
//     resistances: Map<DamageType, number>;
//     level: number;
// }
//
// interface Weapon {
//     damage: number;
//     damageType: DamageType;
//     criticalMultiplier: number;
//     criticalChance: number;
// }
//
// class DamageCalculator {
//     calculateDamage(player: Character, weapon: Weapon, damageModifier: number = 1): number {
//         const scaledBaseDamage = player.baseDamage + player.level * 2;
//         const damage = this.isCriticalHit(weapon.criticalChance)
//             ? (scaledBaseDamage + weapon.damage) * weapon.criticalMultiplier
//             : scaledBaseDamage + weapon.damage;
//         const resistance = player.resistances.get(weapon.damageType) || 0;
//         const mitigatedDamage = damage - player.armor - damage * resistance;
//         const finalDamage = Math.max(0, mitigatedDamage) * damageModifier;
//         const randomFactor = 0.9 + Math.random() * 0.2; // Randomness: damage within 90-110% of calculated damage
//         const scaledDamage = finalDamage * randomFactor;
//         return Math.round(scaledDamage);
//     }
//
//     private isCriticalHit(criticalChance: number): boolean {
//         return Math.random() < criticalChance;
//     }
// }
//
// // Example usage:
// const resistances = new Map<DamageType, number>();
// resistances.set('Physical', 0.1); // 10% resistance to physical damage
//
// const character: Character = {
//     baseDamage: 50,
//     armor: 10,
//     resistances,
//     level: 5,
// };
//
// const sword: Weapon = {
//     damage: 40,
//     damageType: 'Physical',
//     criticalMultiplier: 1.5,
//     criticalChance: 0.2, // 20% critical hit chance
// };
//
// const playerDamageCalculator = new DamageCalculator();
// const playerDamage = playerDamageCalculator.calculateDamage(character, sword, 1.2);
