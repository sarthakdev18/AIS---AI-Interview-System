var app = document.getElementById('typing');

var typewriter = new Typewriter(app, {
    loop: true
});

typewriter.typeString('Simplifying online proctoring')
.pauseFor(700)
.deleteChars(29)
.typeString('Making hiring easy')
.pauseFor(700)
.deleteChars(18)
.typeString('')
.pauseFor(700)
.deleteAll()
.start();