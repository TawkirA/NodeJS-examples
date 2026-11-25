exports.getHealthCheck = (req, res, next) => {
    console.log('CTRL');
    res.status(200).json({ status: 'OK' });
}

// module.exports = getHealthCheckInfo;