// Define the event structure
interface RewardAnswer {
    choice: string;
    reward: string;
}

interface RewardEvent {
    description: string;
    question: string;
    answers: { good: RewardAnswer; neutral: RewardAnswer; bad: RewardAnswer };
}

interface Answer {
    choice: string;
    followUpQuestion: RewardEvent;
}

interface Event {
    description: string;
    question: string;
    answers: { good: Answer; neutral: Answer; bad: Answer };
}

const spaceAlienEvent: Event = {
    description:
        "You are flying through the galaxy in your spaceship, looking for clues about your missing family members. Suddenly, you see a small and colorful ship on your radar. It's an alien, and he's waving at you!",
    question: 'What do you do?',
    answers: {
        good: {
            choice: 'Wave back and invite him to your ship',
            followUpQuestion: {
                description:
                    'You wave back and open your hatch. The alien flies in and lands on your ship. He is a cute and furry creature with big eyes and antennae. He introduces himself as Zeebo, and says he is a space explorer.',
                question: 'Do you want to be friends with him?',
                answers: {
                    good: {
                        choice: 'Yes, I do',
                        reward: 'You and Zeebo become fast friends. He tells you stories about his adventures and shows you his gadgets. He also gives you a map of the galaxy and some useful tips. You are happy!',
                    },
                    neutral: {
                        choice: 'Maybe, I do',
                        reward: 'You and Zeebo are friendly, but not very close. He tells you some facts about the galaxy and shows you his tools. He also gives you a compass and some advice. You are satisfied.',
                    },
                    bad: {
                        choice: "No, I don't",
                        reward: "You and Zeebo don't get along well. He annoys you with his jokes and pranks. He also gives you a fake map and some bad tips. You are angry!",
                    },
                },
            },
        },
        neutral: {
            choice: 'Wave back and keep your distance',
            followUpQuestion: {
                description:
                    'You wave back and maintain a safe distance. The alien follows you and tries to communicate with you. He is a small and scaly creature with horns and wings. He introduces himself as Rax, and says he is a space trader.',
                question: 'Do you want to trade with him?',
                answers: {
                    good: {
                        choice: 'Yes, I do',
                        reward: 'You and Rax make a fair deal. He offers you some rare items and resources for a reasonable price. He also gives you a coupon for his shop and some recommendations. You are pleased!',
                    },
                    neutral: {
                        choice: 'Maybe, I do',
                        reward: 'You and Rax make an average deal. He offers you some common items and resources for a standard price. He also gives you a flyer for his shop and some suggestions. You are okay.',
                    },
                    bad: {
                        choice: "No, I don't",
                        reward: "You and Rax don't make a deal. He offers you some junk items and resources for a high price. He also gives you a bill for his time and some insults. You are annoyed!",
                    },
                },
            },
        },
        bad: {
            choice: 'Ignore him and fly away',
            followUpQuestion: {
                description:
                    'You ignore him and speed up. The alien chases you and tries to stop you. He is a big and slimy creature with tentacles and teeth. He introduces himself as Glorg, and says he is a space hunter.',
                question: 'Do you want to fight him?',
                answers: {
                    good: {
                        choice: 'Yes, I do',
                        reward: 'You turn around and face Glorg. You use your weapons and skills to attack him. He is surprised by your courage and strength. You defeat him!',
                    },
                    neutral: {
                        choice: 'Maybe, I do',
                        reward: 'You try to avoid Glorg, but he catches up with you. You use your shields and tricks to defend yourself. He is impressed by your cunning and speed. You escape him!',
                    },
                    bad: {
                        choice: "No, I don't",
                        reward: 'You run away from Glorg, but he overtakes you. You use your pleas and bribes to beg him. He is disgusted by your cowardice and greed. He captures you!',
                    },
                },
            },
        },
    },
};
const underwaterAdventureEvent: Event = {
    description:
        "Your spaceship submerges into the depths of the 'Aquaria' planet, a vast ocean world teeming with bioluminescent flora and fauna. Timmy is excited but also a little apprehensive about exploring this underwater wonderland.",
    question:
        "As you descend further into the ocean, you spot a giant seashell with a mysterious glow. Timmy swims closer to investigate, and suddenly, the seashell opens to reveal a talking dolphin. It asks, 'Would you like to join me on an underwater adventure to uncover a hidden treasure?'",
    answers: {
        good: {
            choice: "Accept the dolphin's invitation and embark on the adventure.",
            followUpQuestion: {
                description:
                    "You and the talking dolphin dive deeper into the Aquaria's depths, swimming through coral reefs, navigating through ancient shipwrecks, and encountering astonishing marine creatures. Your adventure leads to a secret underwater cave, where the treasure is hidden.",
                question: 'What do you do with the discovered treasure?',
                answers: {
                    good: {
                        choice: 'Share the treasure with the talking dolphin.',
                        reward: "You and the dolphin become friends and share the treasure's magic.",
                    },
                    neutral: {
                        choice: 'Keep the treasure for yourself.',
                        reward: "You claim the treasure's power but leave the ocean's mysteries untouched.",
                    },
                    bad: {
                        choice: 'Leave the treasure behind and return to your spaceship.',
                        reward: 'You decide to leave the treasure, returning to the surface with a sense of fulfillment.',
                    },
                },
            },
        },
        neutral: {
            choice: 'Politely decline the offer and continue exploring the ocean.',
            followUpQuestion: {
                description:
                    "You thank the talking dolphin for its offer and continue to explore the wondrous aquatic world of Aquaria. As you venture deeper, you encounter luminous jellyfish, swim through submerged caves, and make observations about the planet's unique marine life.",
                question: "What aspect of Aquaria's ocean do you wish to explore next?",
                answers: {
                    good: {
                        choice: 'Investigate an underwater trench for hidden secrets.',
                        reward: 'You uncover ancient artifacts within the trench.',
                    },
                    neutral: {
                        choice: 'Glide through a forest of giant kelp.',
                        reward: 'You enjoy the serenity of the kelp forest and gain insights into its ecosystem.',
                    },
                    bad: {
                        choice: 'Return to your spaceship and continue your quest.',
                        reward: "You leave Aquaria's ocean behind, focused on your mission to find your family.",
                    },
                },
            },
        },
        bad: {
            choice: 'Ignore the talking dolphin and return to your spaceship.',
            followUpQuestion: {
                description:
                    "You ignore the dolphin's offer, swimming back to your spaceship and ascending to the surface. The vibrant world of Aquaria is left behind as you continue your journey to find your family.",
                question: 'As you depart from the ocean, what thoughts occupy your mind?',
                answers: {
                    good: {
                        choice: 'Feel a sense of wonder and curiosity.',
                        reward: "You can't help but wonder about the hidden treasure and the talking dolphin.",
                    },
                    neutral: {
                        choice: 'Appreciate the peace and quiet of your spaceship.',
                        reward: "You find comfort in the quiet of your spaceship's familiar surroundings.",
                    },
                    bad: {
                        choice: 'Forget about Aquaria and focus on your mission.',
                        reward: 'You put Aquaria behind you, determined to find your family.',
                    },
                },
            },
        },
    },
};
const nebulaExplorationEvent: Event = {
    description:
        "Your spaceship finds itself within a colorful and mysterious space nebula known as 'Stardust Veil.' The swirling cosmic clouds of gas and dust create a breathtaking celestial display. Timmy gazes in awe at the ever-shifting colors and patterns of the nebula.",
    question:
        "As you navigate through the Stardust Veil, you detect a peculiar anomaly: a glowing, ethereal path leading deeper into the nebula. Timmy turns to you and asks, 'Should we follow the path and explore what lies within?'",
    answers: {
        good: {
            choice: 'Follow the ethereal path and venture deeper into the nebula.',
            followUpQuestion: {
                description:
                    "You and your crew follow the ethereal path, which guides you through the Stardust Veil's mesmerizing swirls and patterns. Along the way, you encounter ethereal beings, unlock secrets of the nebula, and reach a hidden cosmic gateway.",
                question: "What do you do with the cosmic gateway you've discovered?",
                answers: {
                    good: {
                        choice: 'Activate the gateway and explore the unknown realm.',
                        reward: 'You embark on a thrilling adventure in a parallel dimension, uncovering valuable knowledge and artifacts.',
                    },
                    neutral: {
                        choice: "Document the gateway's location for future exploration.",
                        reward: "You make a record of the gateway's location for potential future research.",
                    },
                    bad: {
                        choice: 'Leave the gateway untouched and continue your journey.',
                        reward: 'You decide to leave the gateway unactivated, preserving the mystery of Stardust Veil.',
                    },
                },
            },
        },
        neutral: {
            choice: 'Observe the ethereal path but stay on your current course.',
            followUpQuestion: {
                description:
                    "You choose not to follow the ethereal path and continue on your original course through the nebula. The Stardust Veil's mesmerizing beauty continues to captivate you, and you make observations and measurements to further your understanding of the nebula.",
                question: 'What aspect of the nebula do you wish to study next?',
                answers: {
                    good: {
                        choice: "Analyze the nebula's magnetic field.",
                        reward: "Your analysis yields valuable data about the nebula's magnetic properties.",
                    },
                    neutral: {
                        choice: 'Collect samples of stardust and cosmic gases.',
                        reward: 'You gather pristine samples for scientific research.',
                    },
                    bad: {
                        choice: 'Continue your journey through the Stardust Veil.',
                        reward: 'You keep moving forward, intent on finding your family in the vast cosmos.',
                    },
                },
            },
        },
        bad: {
            choice: 'Avoid the ethereal path and proceed to leave the nebula.',
            followUpQuestion: {
                description:
                    'You decide to steer clear of the ethereal path and make your way to the outer edge of the Stardust Veil. The colorful nebula gradually fades as you exit its boundaries, leaving you with a sense of having missed out on the unknown wonders it held.',
                question: 'As you leave the nebula behind, what thoughts linger in your mind?',
                answers: {
                    good: {
                        choice: 'Regret not following the ethereal path.',
                        reward: "You can't help but wonder about the mysteries that path might have held.",
                    },
                    neutral: {
                        choice: 'Appreciate the serenity of space outside the nebula.',
                        reward: 'You find solace in the peaceful expanse beyond the Stardust Veil.',
                    },
                    bad: {
                        choice: 'Concentrate on your mission to find your family.',
                        reward: 'You remain focused on your quest, determined to reunite with your missing loved ones.',
                    },
                },
            },
        },
    },
};
const enchantedForestEvent: Event = {
    description:
        "Your spaceship lands in a mysterious forest on the planet 'Fayewoods.' The trees are massive, their trunks adorned with glowing patterns, and the air is filled with the sweet scent of blooming flowers. Timmy eagerly steps out of the ship, his eyes wide with wonder.",
    question:
        "Timmy comes across a talking squirrel perched on a luminescent branch. The squirrel looks at him and asks, 'Will you help me find a lost treasure hidden deep within the Fayewoods?'",
    answers: {
        good: {
            choice: 'Agree to help the squirrel find the treasure.',
            followUpQuestion: {
                description:
                    "You and the talking squirrel embark on a magical journey deeper into the enchanted forest. Along the way, you encounter mystical creatures and solve riddles that guide you to the treasure's location.",
                question: "You finally reach the treasure's hiding place. What do you do?",
                answers: {
                    good: {
                        choice: 'Share the treasure with the squirrel.',
                        reward: "You and the squirrel share the treasure's magic and form a lifelong friendship.",
                    },
                    neutral: {
                        choice: 'Take the treasure for yourself.',
                        reward: "You claim the treasure's power, but the forest's magic remains elusive.",
                    },
                    bad: {
                        choice: 'Leave the treasure and return to your spaceship.',
                        reward: "You decide to leave the treasure behind, feeling the forest's enchantment as you depart.",
                    },
                },
            },
        },
        neutral: {
            choice: 'Politely decline and continue exploring the forest.',
            followUpQuestion: {
                description:
                    "You bid farewell to the talking squirrel and continue exploring the enchanting Fayewoods. You encounter more wonders and mysteries, each one adding to your adventure's enchantment.",
                question: 'What do you wish to explore next?',
                answers: {
                    good: {
                        choice: 'Search for ancient ruins hidden in the forest.',
                        reward: 'You uncover ancient knowledge hidden within the ruins.',
                    },
                    neutral: {
                        choice: 'Climb the massive luminescent tree.',
                        reward: 'You reach a stunning viewpoint at the treetop and gain a new perspective on the forest.',
                    },
                    bad: {
                        choice: 'Head back to your spaceship.',
                        reward: 'You return to the spaceship with a sense of wonder but miss out on potential discoveries.',
                    },
                },
            },
        },
        bad: {
            choice: 'Ignore the squirrel and return to your spaceship.',
            followUpQuestion: {
                description:
                    "You ignore the talking squirrel's request and head back to your spaceship. The forest's enchantment slowly fades as you depart, leaving behind untold mysteries.",
                question: 'As you leave the forest, what thoughts linger in your mind?',
                answers: {
                    good: {
                        choice: 'Feel a sense of regret and curiosity.',
                        reward: "You can't help but wonder about the lost treasure and the talking squirrel.",
                    },
                    neutral: {
                        choice: 'Enjoy the comfort of your spaceship.',
                        reward: 'You feel safe and secure in the familiar surroundings of your spaceship.',
                    },
                    bad: {
                        choice: 'Forget about the forest and continue your quest.',
                        reward: 'You put the forest behind you and focus on your mission to find your family.',
                    },
                },
            },
        },
    },
};
const crystalPlanetEvent: Event = {
    description:
        "You and your crew land on a planet that is covered in colorful crystals. You see a sign that says 'Welcome to Crystalia, the most dazzling planet in the galaxy'. You decide to explore the planet and see what treasures it might hold.",
    question: 'What do you do first?',
    answers: {
        good: {
            choice: "You follow the sign that says 'Crystal Museum'.",
            followUpQuestion: {
                description:
                    'You enter the museum and see a huge display of different types of crystals. Some of them are glowing, some of them are moving, and some of them are making sounds. You are amazed by the variety and beauty of the crystals.',
                question: 'What do you want to see more of?',
                answers: {
                    good: {
                        choice: 'You go to the section that has glowing crystals.',
                        reward: 'You find a crystal that emits a warm and soothing light. You touch it and feel a surge of energy. You gain +10 health.',
                    },
                    neutral: {
                        choice: 'You go to the section that has moving crystals.',
                        reward: 'You find a crystal that changes shape and color when you touch it. You play with it for a while and have some fun. You gain +5 happiness.',
                    },
                    bad: {
                        choice: 'You go to the section that has sound-making crystals.',
                        reward: 'You find a crystal that makes a loud and annoying noise when you touch it. You quickly drop it and cover your ears. You lose -5 health.',
                    },
                },
            },
        },
        neutral: {
            choice: 'You wander around the planet and look for interesting crystals.',
            followUpQuestion: {
                description:
                    'You walk around the planet and see many different kinds of crystals. Some of them are big, some of them are small, and some of them are hidden. You try to find the most rare and valuable ones.',
                question: 'How do you search for crystals?',
                answers: {
                    good: {
                        choice: 'You use your scanner to detect the most rare and valuable crystals.',
                        reward: 'You find a crystal that is worth a lot of money. You sell it to a merchant and get +100 credits.',
                    },
                    neutral: {
                        choice: 'You use your intuition to guide you to the most rare and valuable crystals.',
                        reward: 'You find a crystal that is pretty but not very valuable. You keep it as a souvenir and get +10 happiness.',
                    },
                    bad: {
                        choice: 'You use your luck to stumble upon the most rare and valuable crystals.',
                        reward: 'You find a crystal that is cursed and brings bad luck. You lose -10 health, -10 happiness, and -10 credits.',
                    },
                },
            },
        },
        bad: {
            choice: 'You ignore the sign and go to the opposite direction.',
            followUpQuestion: {
                description:
                    'You go to the dark side of the planet where there are no crystals. You see a group of shady-looking aliens who seem to be up to no good. They notice you and approach you with hostile intentions.',
                question: 'What do you do next?',
                answers: {
                    good: {
                        choice: 'You fight back with your weapons and skills.',
                        reward: 'You manage to defeat the aliens and escape from their territory. You gain +10 experience.',
                    },
                    neutral: {
                        choice: 'You negotiate with the aliens and try to avoid conflict.',
                        reward: 'You manage to convince the aliens to leave you alone, but they demand some of your belongings as compensation. You lose -50 credits.',
                    },
                    bad: {
                        choice: 'You run away from the aliens and try to hide.',
                        reward: 'You fail to escape from the aliens and they capture you. They take you to their base and torture you for information. You lose -20 health, -20 happiness, and -20 credits.',
                    },
                },
            },
        },
    },
};
const enchantedNebulaEvent: Event = {
    description:
        'As your spaceship glides through the mysterious Enchanted Nebula, a captivating crystal formation catches your eye. Your young protagonist and the crew find themselves drawn to the radiant spectacle, its allure impossible to resist.',
    question: 'What would you like to do?',
    answers: {
        good: {
            choice: 'Approach the crystal formation',
            followUpQuestion: {
                description:
                    "You cautiously approach the glowing crystals, bathed in their soft, soothing light. It's as if the crystals are whispering ancient secrets to you.",
                question: "What's your next step in this ethereal encounter?",
                answers: {
                    good: {
                        choice: 'Reach out and touch the crystals',
                        reward: "As you reach out and touch the crystals, they respond to your presence, revealing a hidden message that could hold a valuable clue about your family's whereabouts.",
                    },
                    neutral: {
                        choice: 'Observe the crystals from a distance',
                        reward: "You opt to observe the crystals from a safe distance, admiring their beauty but gaining no additional insight into your family's location.",
                    },
                    bad: {
                        choice: 'Ignore the crystals and continue your journey',
                        reward: 'You decide to ignore the crystals and press on with your mission, potentially missing out on a valuable opportunity for assistance.',
                    },
                },
            },
        },
        neutral: {
            choice: 'Continue on your current course',
            followUpQuestion: {
                description:
                    'You decide to maintain your course and avoid the crystal formation. The crew seems a bit disheartened by the missed opportunity.',
                question: "How would you like to address your crew's disappointment?",
                answers: {
                    good: {
                        choice: 'Explain your decision and offer reassurance',
                        reward: 'You explain your rationale to the crew, reassuring them that staying focused is crucial for the mission. This boosts their morale and renews their determination.',
                    },
                    neutral: {
                        choice: 'Simply continue without addressing their disappointment',
                        reward: "You choose to ignore the crew's disappointment, and they gradually regain their focus on the mission, but some lingering disappointment remains.",
                    },
                    bad: {
                        choice: 'Scold the crew for their distraction',
                        reward: 'You scold the crew for getting distracted, leaving them disheartened but also refocused on the mission.',
                    },
                },
            },
        },
        bad: {
            choice: 'Change course to avoid the crystals',
            followUpQuestion: {
                description:
                    'You decide to alter your course and steer clear of the crystals, causing the crew to express their disappointment openly.',
                question: "How do you respond to your crew's dismay?",
                answers: {
                    good: {
                        choice: 'Apologize to the crew and promise to explore such phenomena later',
                        reward: 'You apologize to the crew and promise to investigate similar phenomena in the future, boosting their spirits and enthusiasm for future adventures.',
                    },
                    neutral: {
                        choice: "Ignore the crew's disappointment and continue on the new course",
                        reward: 'You choose to ignore their disappointment, and the crew gradually regains their focus on the mission, though some lingering disappointment remains.',
                    },
                    bad: {
                        choice: 'Reprimand the crew for their distraction',
                        reward: 'You reprimand the crew for their distraction, leaving them disheartened and demotivated, but firmly back on track.',
                    },
                },
            },
        },
    },
};

export const EVENTS = {
    spaceAlienEvent,
    underwaterAdventureEvent,
    nebulaExplorationEvent,
    enchantedForestEvent,
    crystalPlanetEvent,
    enchantedNebulaEvent,
};
