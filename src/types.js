// ============================================
// JSDoc Type Definitions for 金庸武俠 RPG
// Pure type definitions — no runtime code
// ============================================

// ---- Core Player Types ----

/**
 * @typedef {Object} FiveAttributes
 * @property {number} str   - 臂力
 * @property {number} bra   - 膽識
 * @property {number} wis   - 悟性
 * @property {number} luk   - 福緣
 * @property {number} con   - 定力
 */

/**
 * @typedef {Object} MartialArtEntry
 * @property {string} id    - 武功ID
 * @property {number} level - 武功等級 1~5
 * @property {number} [ratio]     - 自創武功 damage ratio (fusion only)
 * @property {string} [name]      - 自創武功 name (fusion only)
 * @property {string} [type]      - 自創武功 type (fusion only)
 * @property {string} [tier]      - 自創武功 tier (fusion only)
 * @property {number} [mp]        - 自創武功 mp cost (fusion only)
 * @property {string} [desc]      - 自創武功 desc (fusion only)
 * @property {string} [fromBase]  - 融合源 (fusion only)
 * @property {string} [fromSub]   - 融合源 (fusion only)
 */

/**
 * @typedef {Object} SlotEquipment
 * @property {?string} weapon
 * @property {?string} armor
 * @property {?string} accessory
 */

/**
 * @typedef {Object} PlayerData
 * @property {string} name
 * @property {string} characterId
 * @property {number} level
 * @property {number} exp
 * @property {number} hp
 * @property {number} maxHp
 * @property {number} mp
 * @property {number} maxMp
 * @property {number} strength
 * @property {number} constitution
 * @property {number} agility
 * @property {number} innerPower
 * @property {number} skillPoints
 * @property {number} silver
 * @property {number[]} skills
 * @property {number[]} skillExp
 * @property {{ nodes: boolean[] }[]} skillTree
 * @property {{ id: string, amount: number }[]} inventory
 * @property {SlotEquipment} equipped
 * @property {Record<string, boolean>} achievements
 * @property {number} battleCount
 * @property {number} killCount
 * @property {string[]} titles
 * @property {number} combatExp
 * @property {number} studyPoints
 * @property {number} fame
 * @property {number} karma
 * @property {?string} sect
 * @property {number} sectReputation
 * @property {MartialArtEntry[]} martialArts
 * @property {(?string)[]} equippedSkills
 * @property {FiveAttributes} attributes
 * @property {number} attributePoints
 */

/**
 * @typedef {Object} LifeSkillData
 * @property {number} level
 * @property {number} exp
 */

/**
 * @typedef {Object} LifeSkills
 * @property {LifeSkillData} herbalism
 * @property {LifeSkillData} mining
 * @property {LifeSkillData} smithing
 * @property {LifeSkillData} tailoring
 * @property {LifeSkillData} alchemy
 * @property {LifeSkillData} cooking
 * @property {LifeSkillData} fishing
 * @property {LifeSkillData} farming
 */

/**
 * @typedef {Object} AuctionData
 * @property {AuctionListing[]} listings
 */

/**
 * @typedef {Object} AuctionListing
 * @property {string} id
 * @property {string} itemId
 * @property {number} amount
 * @property {number} price
 * @property {string} seller
 */

/**
 * @typedef {Object} WalletData
 * @property {WalletTransaction[]} transactions
 */

/**
 * @typedef {Object} WalletTransaction
 * @property {string} type
 * @property {number} amount
 * @property {number} time
 * @property {string} [desc]
 */

/**
 * @typedef {Object} GameState
 * @property {PlayerData} player
 * @property {LifeSkills} lifeSkills
 * @property {AuctionData} auction
 * @property {WalletData} wallet
 * @property {string} currentMap
 * @property {boolean} inBattle
 */

// ---- Combat / Skill Types ----

/**
 * @typedef {'basic'|'mid'|'ultimate'|'custom'} ArtTier
 */

/**
 * @typedef {'outer'|'inner'|'passive'} ArtType
 */

/**
 * @typedef {Object} StatusEffect
 * @property {string} type      - 'bleed' | 'stun' | 'defDown'
 * @property {number} duration
 */

/**
 * @typedef {Object} SkillStats
 * @property {number} [defense]
 * @property {number} [speed]
 * @property {number} [dodgeBonus]
 * @property {number} [critBonus]
 * @property {number} [innerDmgBonus]
 * @property {number} [hpRegenBonus]
 * @property {number} [mpRegenBonus]
 * @property {number} [speedBonus]
 * @property {number} [hpBonus]
 * @property {number} [mpBonus]
 * @property {number} [poisonChance]
 * @property {number} [lifesteal]
 * @property {number} [lowHpAtkBonus]
 * @property {number} [comboChance]
 * @property {number} [hpRegenCombat]
 */

/**
 * @typedef {Object} MartialArtDefinition
 * @property {string} id
 * @property {string} name
 * @property {ArtTier} tier
 * @property {ArtType} type
 * @property {number} [mp]
 * @property {number} [ratio]
 * @property {number} [hits]
 * @property {number} [ignoreDef]
 * @property {number} [reflect]
 * @property {number} [selfDamage]
 * @property {number} [healRatio]
 * @property {number} [mpRestore]
 * @property {number} [mpSteal]
 * @property {number} [lifesteal]
 * @property {number} [critBonus]
 * @property {boolean} [aoe]
 * @property {boolean} [cleanse]
 * @property {StatusEffect} [status]
 * @property {SkillStats} [stats]
 * @property {string} desc
 */

/**
 * @typedef {Object} SectDefinition
 * @property {string} name
 * @property {string} key
 * @property {string} map
 * @property {number} npcX
 * @property {number} npcY
 * @property {string} npcName
 * @property {number} karmaRequirement
 * @property {MartialArtDefinition[]} martialArts
 */

// ---- Enemy / Battle Types ----

/**
 * @typedef {Object} EnemyData
 * @property {string} name
 * @property {number} hp
 * @property {number} attack
 * @property {number} defense
 * @property {number} speed
 */

/**
 * @typedef {'normal'|'elite'|'boss'} EnemyTier

/**
 * @typedef {Object} EnemyTierConfig
 * @property {string} label
 * @property {number} hpMul
 * @property {number} atkMul
 * @property {number} defMul
 * @property {number} exp
 * @property {number} silver
 * @property {number} weight
 */

// ---- Item Types ----

/**
 * @typedef {Object} LootEntry
 * @property {string} id
 * @property {number} min
 * @property {number} max
 * @property {number} [chance]
 */

/**
 * @typedef {Object} LootTable
 * @property {LootEntry[]} common
 * @property {LootEntry[]} rare
 * @property {LootEntry[]} eliteGuaranteed
 * @property {LootEntry[]} bossGuaranteed
 */

/**
 * @typedef {Object} ItemStat
 * @property {number} [attack]
 * @property {number} [defense]
 * @property {number} [critBonus]
 * @property {number} [dmgReduction]
 * @property {number} [hpRegenCombat]
 * @property {number} [rageBoost]
 */

/**
 * @typedef {Object} ItemEffect
 * @property {number} [hp]
 * @property {number} [mp]
 * @property {{ amount: number, duration: number }} [atkBuff]
 * @property {{ amount: number, duration: number }} [defBuff]
 * @property {number} [hpRegenCombat]
 * @property {number} [mining_bonus]
 */

/**
 * @typedef {Object} ItemDefinition
 * @property {string} name
 * @property {string} type          - 'material' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'tool'
 * @property {ItemStat} [battleStats]
 * @property {ItemEffect} [effect]
 */

// ---- Recipe / Crafting Types ----

/**
 * @typedef {Object} RecipeDefinition
 * @property {string} name
 * @property {string} type          - 'weapon' | 'consumable' | 'armor' | 'tool'
 * @property {string} skill         - lifeSkill key
 * @property {number} levelRequired
 * @property {Record<string, number>} materials
 * @property {string} result        - result item id
 * @property {ItemStat} [stats]
 * @property {ItemEffect} [effect]
 */

// ---- Gathering Types ----

/**
 * @typedef {Object} GatheringYield
 * @property {string} id
 * @property {number} min
 * @property {number} max
 * @property {{ id: string, chance: number }} [rare]
 */

/**
 * @typedef {Object} GatheringSpot
 * @property {string} type          - 'herb' | 'mining' | 'fishing' | 'farming'
 * @property {number} x
 * @property {number} y
 * @property {string} name
 * @property {GatheringYield} yield
 * @property {number} cd
 */

// ---- Quest Types ----

/**
 * @typedef {Object} QuestObjective
 * @property {string} type          - 'escort' | 'kill' | 'collect'
 * @property {string} target
 * @property {string} label
 * @property {number} current
 * @property {number} count
 */

/**
 * @typedef {Object} QuestRewards
 * @property {number} [silver]
 * @property {number} [studyPoints]
 * @property {number} [fame]
 * @property {number} [karma]
 * @property {number} [sectRep]
 */

/**
 * @typedef {Object} QuestTemplate
 * @property {string} id
 * @property {string} title
 * @property {string} type          - 'escort' | 'bounty' | 'sect'
 * @property {string} desc
 * @property {QuestObjective[]} objectives
 * @property {QuestRewards} rewards
 */

// ---- ActionResult Types ----

/**
 * @typedef {Object} ActionResult
 * @property {boolean} ok
 * @property {string} [reason]
 */

/**
 * @typedef {Object} ItemUseResult
 * @property {boolean} ok
 * @property {string} [reason]
 * @property {string} [itemName]
 * @property {number} [hpRestore]
 * @property {number} [mpRestore]
 * @property {{ amount: number, duration: number }} [atkBuff]
 * @property {{ amount: number, duration: number }} [defBuff]
 * @property {number} [hpRegenCombat]
 */

/**
 * @typedef {Object} CraftResult
 * @property {boolean} ok
 * @property {string} [reason]
 * @property {string} [item]
 * @property {string} [quality]
 * @property {number} [statMul]
 * @property {string} [recipeName]
 */

/**
 * @typedef {Object} GatherResult
 * @property {boolean} ok
 * @property {string} [reason]
 * @property {string} [itemId]
 * @property {number} [amount]
 */

/**
 * @typedef {Object} SectAction
 * @property {boolean} ok
 * @property {string} [reason]
 * @property {string} [sectName]
 * @property {string} [artName]
 * @property {number} [newLevel]
 * @property {number} [repGain]
 */

/**
 * @typedef {Object} QuestAction
 * @property {boolean} ok
 * @property {string} [reason]
 * @property {string} [title]
 * @property {QuestRewards} [rewards]
 */

/**
 * @typedef {Object} FusionAction
 * @property {boolean} ok
 * @property {string} [reason]
 * @property {MartialArtDefinition} [art]
 */

// ---- Chat Types ----

/**
 * @typedef {Object} ChatMessage
 * @property {string} text
 * @property {string} channel
 * @property {number} time
 */

// ---- Sprite Types ----

/**
 * @typedef {Object} SpriteEntry
 * @property {string} path
 * @property {string} key
 */

// ---- Sect Rank Types ----

/**
 * @typedef {Object} SectRank
 * @property {string} name
 * @property {number} minRep
 */

// ---- Character Types ----

/**
 * @typedef {Object} CharacterData
 * @property {string} name
 * @property {string} desc
 * @property {number} baseHp
 * @property {number} baseMp
 * @property {number} str
 * @property {number} con
 * @property {number} agi
 * @property {number} ip
 */

// ---- Skill Definition Types ----

/**
 * @typedef {Object} CharacterSkill
 * @property {string} name
 * @property {number} cost
 * @property {number} damageRatio
 * @property {string} type          - 'inner' | 'outer'
 * @property {string} desc
 * @property {number} [ignoreDef]
 * @property {number} [hits]
 * @property {number} [critBonus]
 * @property {StatusEffect} [status]
 * @property {number} [healRatio]
 * @property {boolean} [aoe]
 * @property {number} [reflect]
 * @property {number} [selfDamage]
 * @property {number} [mpRestore]
 * @property {number} [mpSteal]
 * @property {boolean} [cleanse]
 */

// ---- Achievement Types ----

/**
 * @typedef {Object} AchievementReward
 * @property {number} [silver]
 * @property {string} [item]
 * @property {number} [amount]
 * @property {string} [title]
 */

/**
 * @typedef {Object} AchievementDefinition
 * @property {string} name
 * @property {string} desc
 * @property {AchievementReward} reward
 */

// ---- Battle Buff Types ----

/**
 * @typedef {Object} BattleBuff
 * @property {string} type          - 'atkBuff' | 'defBuff'
 * @property {number} amount
 * @property {number} remaining
 * @property {number} duration
 */

// ---- Config Types ----

/**
 * @typedef {Object} SkillTreeConfig
 * @property {number[]} nodeCosts
 * @property {Array<Object<string, number>>} nodeEffects
 */

/**
 * @typedef {Object} AttributeCycleConfig
 * @property {string[]} cycle
 * @property {Record<string, string>} names
 * @property {Record<string, string>} icons
 * @property {Record<string, string>} advantages
 * @property {Record<string, string>} disadvantage
 * @property {number} damageMultiplier
 * @property {Record<string, ?string>} characterAttribute
 * @property {Object<string, (?string)[]>} skillAttributes
 */

/**
 * @typedef {Object} RageConfig
 * @property {number} maxRage
 * @property {number} gainOnDamage
 * @property {number} gainOnHit
 * @property {number} gainPerTurn
 */

/**
 * @typedef {Object} AtbSpeedConfig
 * @property {number} fillRate
 * @property {number} maxAtb
 * @property {number} playerSpeedMultiplier
 */

/**
 * @typedef {Object} EncounterConfig
 * @property {number} interval
 * @property {number} baseChance
 * @property {Record<string, string[]>} mapEnemies
 */

/**
 * @typedef {Object} CraftQualityConfig
 * @property {string[]} tiers
 * @property {number[]} chances
 * @property {number[]} statMultiplier
 */

export default {};