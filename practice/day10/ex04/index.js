document.addEventListener("DOMContentLoaded", function () {
  const voteButtons = document.querySelectorAll(".vote-btn");

  voteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const name = this.dataset.name;
      alert(`'${name}'을(를) 선택했습니다!`);
    });
  });
});
