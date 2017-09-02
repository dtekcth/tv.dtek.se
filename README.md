# tv.dtek.se

A web service for displaying information/advertisements on a monitor.

## Notice

You may have to make a lot of modifications if you want to use this project yourself since the project is designed to work a specific way.

## Requirements

* Node.js (tested with version 6.11.2 and 8.4.0)
* MySQL
* Reverse Proxy (such as nginx)

## Usage

You have to use our auth project (which will be available [here](https://github.com/dtekcth/auth.dtek.se/) when finished) to use the admin page functionality.

The Node.js web service makes sure that the currentImages.json is updated.

Setup a table for the admins and advertisements:

Admins table:
```SQL
CREATE TABLE `admins` (
  `cid` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
```

Adverts table:
```SQL
CREATE TABLE `advert` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `startDate` int(10) unsigned NOT NULL,
  `endDate` int(10) unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `committee` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `originalFilename` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `currentFilename` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `author` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

```

Copy `config.json.dist` to `config.json` and configure it accordingly for your setup.

Run `npm install` to install the required dependencies.

Run the service by running `node app.js`.

I think that's it.

## Copyright

Copyright 2017 Emil Hemdal [https://emil.hemdal.se/](https://emil.hemdal.se/) and Datateknologsektionen Chalmers Studentkår [https://www.dtek.se/](https://www.dtek.se/)

## License

GNU Affero General Public License version 3
