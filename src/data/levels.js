const baseScenes = [
  {
    sceneImage: '/levels/amphitheater-1.jpg',
    hitbox: { x: 54.5, y: 76, width: 5.5, height: 12 },
    member: {
      name: 'Kiran Bhatt',
      role: 'Campus Gardening Club — Founder',
      intro: "Been quietly tending this courtyard for three years. If it's green and growing here, Kiran probably planted it.",
      skills: ['Composting', 'Native Plants', 'Patience'],
      avatar: '/levels/avatar.svg',
    },
  },
  {
    sceneImage: '/levels/amphitheater-2.jpg',
    hitbox: { x: 47, y: 62, width: 5.5, height: 17 },
    member: {
      name: 'Arjun Mehta',
      role: 'Sketch Club — Resident Artist',
      intro: 'Sits in the same spot every afternoon, sketchbook open, waiting for the light under the tree to turn gold.',
      skills: ['Ink Wash', 'Portraits', 'Street Sketching'],
      avatar: '/levels/avatar.svg',
    },
  },
]

const additionalMembers = [
  { name: 'Mira Shah', role: 'Drama Club — Stage Lead', intro: 'Always appears where the spotlight is brightest.', skills: ['Storytelling', 'Stagecraft', 'Timing'], avatar: '/levels/avatar.svg' },
  { name: 'Noah Dsouza', role: 'Debate Society — Captain', intro: 'A calm voice that knows exactly when to break the silence.', skills: ['Argument', 'Research', 'Confidence'], avatar: '/levels/avatar.svg' },
  { name: 'Tanya Rao', role: 'Music Club — Composer', intro: 'The rhythm in the room always changes when Tanya arrives.', skills: ['Composition', 'Rhythm', 'Curation'], avatar: '/levels/avatar.svg' },
  { name: 'Rohan Iyer', role: 'Coding Club — Mentor', intro: 'The smallest clue often points to the strongest problem-solver.', skills: ['Patterns', 'Logic', 'Mentorship'], avatar: '/levels/avatar.svg' },
  { name: 'Sneha Verma', role: 'Robotics Club — Builder', intro: 'Every mechanism has a quiet architect and Sneha is one of them.', skills: ['CAD', 'Testing', 'Precision'], avatar: '/levels/avatar.svg' },
  { name: 'Ayaan Khan', role: 'Photography Club — Curator', intro: 'Hidden behind frame and focus, Ayaan watches the world differently.', skills: ['Composition', 'Light', 'Story'], avatar: '/levels/avatar.svg' },
  { name: 'Pooja Menon', role: 'Literature Club — Editor', intro: 'A sharp eye and a curious mind make Pooja easy to miss.', skills: ['Editing', 'Analysis', 'Expression'], avatar: '/levels/avatar.svg' },
  { name: 'Vikram Singh', role: 'Sports Club — Captain', intro: 'The first hint is often movement, and Vikram moves with purpose.', skills: ['Strategy', 'Leadership', 'Focus'], avatar: '/levels/avatar.svg' },
]

export const levels = Array.from({ length: 20 }, (_, index) => {
  const base = baseScenes[index % baseScenes.length]
  const member = additionalMembers[index % additionalMembers.length]

  return {
    id: index + 1,
    sceneImage: base.sceneImage,
    hitbox: {
      x: Math.min(88, base.hitbox.x + (index % 3) * 2.2),
      y: Math.min(88, base.hitbox.y - (index % 2) * 3),
      width: Math.max(4.8, base.hitbox.width + (index % 2) * 0.6),
      height: Math.max(8, base.hitbox.height + (index % 3) * 1.2),
    },
    member: {
      ...member,
      avatar: member.avatar,
    },
  }
})
