exports.getAppInfo = (req, res, next) => {
    res.status(200).json({
        appId: '123456',
        appName: 'UI',
        secondtitle: 'Garage'
    })
}