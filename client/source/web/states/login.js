function LoginState() {

}

LoginState.prototype = new StatePrototype();

LoginState.prototype.subLoad = function() {
    this.fragment = document.createDocumentFragment();
    var a = document.createElement("a");
    a.setAttribute("href", "#");
    a.appendChild(document.createTextNode("Login"));
    this.fragment.appendChild(a);

    a.addEventListener("click", this.onLoginClicked);

    this.machine.onStateLoaded(this);
};

LoginState.prototype.onLoginClicked = function(e) {
    window.app.network.postMessage({login:1});
    return false;
};

LoginState.prototype.show = function() {
    document.body.appendChild(this.fragment);

    this.machine.collapse();
};

LoginState.prototype.subDestroy = function() {
    document.body.removeChild(this.fragment);
};

LoginState.prototype.handleMessage = function(message) {
    switch(message.id)
    {
        case Orionark.Messages.LoginRequired.id:
        {
            var out = Orionark.Messages.ClientLogin.create();
            window.app.network.postMessage({message:out});
        }
        break;

        case Orionark.Messages.LoginTicket.id:
        {
            window.app.network.postMessage({transfer:1});
        }
        break;

        default:
            console.log(message);
    }
}