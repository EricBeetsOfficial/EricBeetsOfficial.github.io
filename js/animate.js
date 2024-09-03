const observer = new IntersectionObserver(entries => 
{
    entries.forEach(entry =>
    {
        const square = entry.target;
        if (entry.isIntersecting)
        {
            square.classList.add("square-animation");
        }
        else
        {
            square.classList.remove("square-animation");
        }
    });
});

document.querySelectorAll('.square').forEach(entry => observer.observe(entry));