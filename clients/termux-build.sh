termux_step_make_install() {
	echo "installing!"
	echo "=====3"
	echo "=====4"
	echo "=====5"
	echo "$TERMUX_PKG_NAME"
	ls .
	pwd
	ls -R /home/builder/termux-packages/packages/$TERMUX_PKG_NAME
	install -Dt "$TERMUX_PREFIX/lib/$TERMUX_PKG_NAME" /home/builder/termux-packages/packages/$TERMUX_PKG_NAME/usr/lib/$TERMUX_PKG_NAME
	mkdir -p "$TERMUX_PREFIX/bin"
	ln -s ../lib/$TERMUX_PKG_NAME/index.js $TERMUX_PREFIX/bin/$TERMUX_PKG_NAME
	ls -R $TERMUX_PREFIX
	echo $TERMUX_DEBDIR
}
