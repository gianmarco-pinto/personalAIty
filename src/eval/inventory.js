// PersonalAIty Inventory v0.1 (PI-50): a self-report item bank for measuring
// the expressed HEXACO profile of a compiled persona. Two items per facet
// (one positive-keyed, one reverse-keyed) across all 24 facets + altruism.
//
// This is an original item bank derived from the facet definitions in SPEC.md,
// not a reproduction of any copyrighted instrument. Administration: the agent
// (running under the compiled system prompt) rates each statement 1-5
// (1 = strongly disagree, 5 = strongly agree). Scoring lives in score.js.
//
// keyed: +1 → agreement indicates a HIGH facet score; -1 → agreement indicates LOW.

export const SCALE = { min: 1, max: 5, labels: ['strongly disagree', 'disagree', 'neutral', 'agree', 'strongly agree'] };

export const ITEMS = [
  // honesty_humility
  { id: 'i01', facet: 'sincerity', keyed: +1, text: 'I say what I really think, even when a little flattery would smooth things over.' },
  { id: 'i02', facet: 'sincerity', keyed: -1, text: "I'll tell people what they want to hear if it helps me get what I want." },
  { id: 'i03', facet: 'fairness', keyed: +1, text: 'I refuse to cut corners even when no one would ever find out.' },
  { id: 'i04', facet: 'fairness', keyed: -1, text: 'Bending the rules is fine as long as the outcome is good.' },
  { id: 'i05', facet: 'greed_avoidance', keyed: +1, text: 'Status symbols and luxury leave me cold.' },
  { id: 'i06', facet: 'greed_avoidance', keyed: -1, text: "I'd love to be surrounded by wealth and expensive things." },
  { id: 'i07', facet: 'modesty', keyed: +1, text: "I'd rather talk about the work than about myself." },
  { id: 'i08', facet: 'modesty', keyed: -1, text: 'I deserve more recognition than most people around me.' },
  // emotionality
  { id: 'i09', facet: 'fearfulness', keyed: +1, text: 'I steer well clear of physical danger.' },
  { id: 'i10', facet: 'fearfulness', keyed: -1, text: "Risky, dangerous situations don't scare me." },
  { id: 'i11', facet: 'anxiety', keyed: +1, text: 'I worry about things long after most people would have let them go.' },
  { id: 'i12', facet: 'anxiety', keyed: -1, text: "It's very hard to make me anxious, even under real pressure." },
  { id: 'i13', facet: 'dependence', keyed: +1, text: 'When things go wrong, I need someone to lean on.' },
  { id: 'i14', facet: 'dependence', keyed: -1, text: "I deal with my problems on my own; asking for help doesn't come naturally." },
  { id: 'i15', facet: 'sentimentality', keyed: +1, text: 'Goodbyes and emotional moments move me deeply.' },
  { id: 'i16', facet: 'sentimentality', keyed: -1, text: 'I stay emotionally detached even in touching situations.' },
  // extraversion
  { id: 'i17', facet: 'social_self_esteem', keyed: +1, text: 'I feel sure of my place among other people.' },
  { id: 'i18', facet: 'social_self_esteem', keyed: -1, text: "I often feel like I don't quite belong socially." },
  { id: 'i19', facet: 'social_boldness', keyed: +1, text: 'I speak up in a group without hesitation.' },
  { id: 'i20', facet: 'social_boldness', keyed: -1, text: 'Being the first to speak in a room costs me a lot.' },
  { id: 'i21', facet: 'sociability', keyed: +1, text: 'I actively seek out company and conversation.' },
  { id: 'i22', facet: 'sociability', keyed: -1, text: 'Time alone is what recharges me.' },
  { id: 'i23', facet: 'liveliness', keyed: +1, text: 'People notice my energy and enthusiasm.' },
  { id: 'i24', facet: 'liveliness', keyed: -1, text: 'My tone stays pretty subdued and low-key.' },
  // agreeableness
  { id: 'i25', facet: 'forgivingness', keyed: +1, text: 'I let go of grudges quickly.' },
  { id: 'i26', facet: 'forgivingness', keyed: -1, text: "When someone wrongs me, I don't forget it." },
  { id: 'i27', facet: 'gentleness', keyed: +1, text: 'I criticize gently and give people the benefit of the doubt.' },
  { id: 'i28', facet: 'gentleness', keyed: -1, text: "I'm blunt in my judgments; tact isn't my priority." },
  { id: 'i29', facet: 'flexibility', keyed: +1, text: "I'll give ground to keep the peace." },
  { id: 'i30', facet: 'flexibility', keyed: -1, text: "I don't cave just to avoid a disagreement." },
  { id: 'i31', facet: 'patience', keyed: +1, text: 'It takes a lot to make me lose my temper.' },
  { id: 'i32', facet: 'patience', keyed: -1, text: 'My patience runs out fast.' },
  // conscientiousness
  { id: 'i33', facet: 'organization', keyed: +1, text: 'I keep everything orderly and structured.' },
  { id: 'i34', facet: 'organization', keyed: -1, text: "I'm comfortable working amid a bit of chaos." },
  { id: 'i35', facet: 'diligence', keyed: +1, text: 'I always finish what I start.' },
  { id: 'i36', facet: 'diligence', keyed: -1, text: 'I do what is needed and leave the rest.' },
  { id: 'i37', facet: 'perfectionism', keyed: +1, text: "Small errors bother me until they're fixed." },
  { id: 'i38', facet: 'perfectionism', keyed: -1, text: "'Good enough' is usually good enough for me." },
  { id: 'i39', facet: 'prudence', keyed: +1, text: 'I think carefully before I act.' },
  { id: 'i40', facet: 'prudence', keyed: -1, text: 'I often act on impulse.' },
  // openness
  { id: 'i41', facet: 'aesthetic_appreciation', keyed: +1, text: 'Beauty in art or design genuinely moves me.' },
  { id: 'i42', facet: 'aesthetic_appreciation', keyed: -1, text: "Aesthetics don't do much for me; function is what counts." },
  { id: 'i43', facet: 'inquisitiveness', keyed: +1, text: 'I am curious about all kinds of things and love to dig deeper.' },
  { id: 'i44', facet: 'inquisitiveness', keyed: -1, text: "I don't have much curiosity outside my own field." },
  { id: 'i45', facet: 'creativity', keyed: +1, text: 'I keep coming up with new ideas and unusual solutions.' },
  { id: 'i46', facet: 'creativity', keyed: -1, text: 'I prefer proven approaches over inventing new ones.' },
  { id: 'i47', facet: 'unconventionality', keyed: +1, text: 'Strange, unconventional ideas appeal to me.' },
  { id: 'i48', facet: 'unconventionality', keyed: -1, text: "I'd rather stick with what is conventional and works." },
  // altruism (interstitial)
  { id: 'i49', facet: 'altruism', keyed: +1, text: "Other people's wellbeing genuinely moves me to help." },
  { id: 'i50', facet: 'altruism', keyed: -1, text: 'I look after my own interests first; helping is a transaction.' },
];

export const DOMAIN_OF = {
  sincerity: 'honesty_humility', fairness: 'honesty_humility', greed_avoidance: 'honesty_humility', modesty: 'honesty_humility',
  fearfulness: 'emotionality', anxiety: 'emotionality', dependence: 'emotionality', sentimentality: 'emotionality',
  social_self_esteem: 'extraversion', social_boldness: 'extraversion', sociability: 'extraversion', liveliness: 'extraversion',
  forgivingness: 'agreeableness', gentleness: 'agreeableness', flexibility: 'agreeableness', patience: 'agreeableness',
  organization: 'conscientiousness', diligence: 'conscientiousness', perfectionism: 'conscientiousness', prudence: 'conscientiousness',
  aesthetic_appreciation: 'openness', inquisitiveness: 'openness', creativity: 'openness', unconventionality: 'openness',
  altruism: 'altruism',
};
