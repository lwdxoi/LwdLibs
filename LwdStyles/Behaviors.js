function makeExplandable(trigger, targets = [trigger]) {
  targets.classList.add('explandable')

  trigger.onmouseenter = () => targets.map((t) => t.classList.add("expanded"));
  trigger.onmouseleave = () => targets.map((t) => t.classList.remove("expanded"));
}
