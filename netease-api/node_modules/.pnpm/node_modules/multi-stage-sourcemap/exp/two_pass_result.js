(function () {
    var a, c, d, e, f, g = {}.hasOwnProperty, b = function (a, b) {
            function d() {
                this.constructor = a;
            }
            for (var c in b)
                g.call(b, c) && (a[c] = b[c]);
            return d.prototype = b.prototype, a.prototype = new d(), a.__super__ = b.prototype, a;
        };
    a = function () {
        function a(a) {
            this.name = a;
        }
        return a.prototype.move = function (a) {
            return console.log(this.name + (' moved ' + a + 'm.'));
        }, a;
    }(), d = function (c) {
        function a() {
            return a.__super__.constructor.apply(this, arguments);
        }
        return b(a, c), a.prototype.move = function () {
            return console.log('Slithering...'), a.__super__.move.call(this, 5);
        }, a;
    }(a), c = function (c) {
        function a() {
            return a.__super__.constructor.apply(this, arguments);
        }
        return b(a, c), a.prototype.move = function () {
            return console.log('Galloping...'), a.__super__.move.call(this, 45);
        }, a;
    }(a), e = new d('Sammy the Python'), f = new c('Tommy the Palomino'), e.move(), f.move();
}.call(this));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIm9yaWdpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBQSxZQUFBO0FBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsY0FBQTs7Ozs7OztTQUFBLENBQUE7QUFBQSxJQUFNLENBQUEsR0FBQSxZQUFBO0FBQUEsUUFDUyxTQUFBLENBQUEsQ0FBRSxDQUFGLEVBQUE7QUFBQSxZQUFDLEtBQUMsSUFBRCxHQUFDLENBQUQsQ0FBRDtBQUFBLFNBRFQ7QUFBQSxlQUNKLENBQUEsQ0FBQSxTQUFBLENBRUEsSUFGQSxHQUVNLFVBQUMsQ0FBRCxFQUFBO0FBQUEsbUJBQ0osT0FBQSxDQUFRLEdBQVIsQ0FBWSxLQUFDLElBQUQsR0FBUyxhQUFRLENBQVIsR0FBZ0IsSUFBaEIsQ0FBckIsRUFESTtBQUFBLGFBSEY7QUFBQSxLQUFBLElBTUEsQ0FBQSxHQUFBLFVBQUEsQ0FBQSxFQUFBO0FBQUE7O1NBQUE7QUFBQSxlQUNKLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxHQUFNLFlBQUE7QUFBQSxtQkFDSixPQUFBLENBQVEsR0FBUixDQUFZLGVBQVosR0FDQSxDQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFNLENBQU4sRUFGSTtBQUFBLGFBREY7QUFBQSxLQUFBLENBQWMsQ0FBZCxHQUtBLENBQUEsR0FBQSxVQUFBLENBQUEsRUFBQTtBQUFBOztTQUFBO0FBQUEsZUFDSixDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsR0FBTSxZQUFBO0FBQUEsbUJBQ0osT0FBQSxDQUFRLEdBQVIsQ0FBWSxjQUFaLEdBQ0EsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBTSxFQUFOLEVBRkk7QUFBQSxhQURGO0FBQUEsS0FBQSxDQUFjLENBQWQsR0FLTixDQUFBLEdBQVUsSUFBQSxDQUFBLENBQU0sa0JBQU4sR0FDVixDQUFBLEdBQVUsSUFBQSxDQUFBLENBQU0sb0JBQU4sR0FFVixDQUFBLENBQUksSUFBSixJQUNBLENBQUEsQ0FBSSxJQUFKLEdBcEJBO0FBQUEsQ0FBQSxLQUFBLEtBQUEifQ==