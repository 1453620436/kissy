/*jshint quotmark:false*/

    var Overlay = require('overlay');
    describe("view", function () {
        it("should reflect after create", function () {
            var overlay = new Overlay({
                content:"haha"
            });
            overlay.create();
            overlay.set('visible', false);
            overlay.render();
            expect(overlay.get('visible')).toBe(false);
            expect(overlay.get('el').css('visibility')).toBe("hidden");
            overlay.destroy();
        });

        it("should show after call hide after create", function () {
            var overlay = new Overlay({
                content:"haha"
            });
            overlay.create();
            overlay.hide();
            overlay.show();
            expect(overlay.get('visible')).toBe(true);
            expect(overlay.get('el').css('visibility')).not.toBe('hidden');
            overlay.destroy();
        });
    });
