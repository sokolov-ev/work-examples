(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminStatistics', AdminStatistics);

    AdminStatistics.$inject = ['Page', 'Statistics', '$state', 'localStorageService', 'Auth', '$stateParams'];

    function AdminStatistics(Page, Statistics, $state, localStorageService, Auth, $stateParams) {
        let vm = this;
        let user = Auth.getUser();

        vm.statistics = [];
        vm.weekTableHeader = [];
        vm.monthTableHeader = [];
        vm.weeklyDatePicker = '';
        vm.monthlyDatePicker = '';

        vm.dates = initDates();

        vm.nextDate = nextDate;
        vm.previousDate = previousDate;
        vm.goToStat = goToStat;
        vm.goToWeek = goToWeek;
        vm.saveDates = saveDates;
        vm.resetToWeek = resetToWeek;
        vm.changeFormat = changeFormat;
        vm.getClassForWeek = getClassForWeek;
        vm.getClassForMonth = getClassForMonth;

        Page.setTitle('Статистика');

        init();
        loadData();

        ///////////

        function init () {
            setDatesInInputs();

            if (vm.dates.format == 'month') {
                $state.go('admin.general-statistics', {format: 'month', day: moment(new Date(vm.dates.start)).format('YYYY-MM-DD')}, {notify: false});
            } else {
                $state.go('admin.general-statistics', {format: null, day: null}, {notify: false});
            }

            $('#weeklyDatePicker').datepicker({
                language: 'ru',
                autoclose: true,
                format: 'yyyy/mm/dd',
                forceParse: false,
            })
            .datepicker("setDate", new Date(vm.dates.start))
            .on("changeDate", function(event) {
                saveDates(event.date, 'week');
            });

            $("#monthlyDatePicker").datepicker({
                language: 'ru',
                format: 'MM yyyy',
                viewMode: 'months',
                minViewMode: 'months',
            })
            .datepicker("setDate", new Date(vm.dates.start))
            .on("changeDate", function(event) {
                $state.go('admin.general-statistics', {format: 'month', day: moment(new Date(event.date)).format('YYYY-MM-DD')}, {notify: false});
                saveDates(event.date, 'month');
            });
        };

        function setDatesInInputs () {
            vm.weeklyDatePicker = moment(vm.dates.start).format('DD.MM.YYYY') + ' - ' + moment(vm.dates.end).format('DD.MM.YYYY');
            vm.monthlyDatePicker = vm.dates.month;
        };

        function initDates () {
            let localData = localStorageService.get(user._id + '-statistics-dates');

            if ($stateParams.day && $stateParams.format) {
                return getDateRange($stateParams.day, $stateParams.format);
            } else if (localData) {
                return localData;
            } else {
                return getDateRange(new Date(), 'week');
            }
        };

        function loadData () {
            let rangeData = getWeeksInMonth(vm.dates.start);
            let sendData = {
                end: moment(vm.dates.end).format('X'),
                start: moment(vm.dates.start).format('X'),
            };
            let trustDates = [];
            let rows = {};
            let weekRows = {};
            let countDays = moment(vm.dates.end).diff(vm.dates.start, 'days') + 1;

            vm.weekTableHeader = [];
            vm.monthTableHeader = rangeData.title;

            for (let i = 0; i < 7; i++) {
                vm.weekTableHeader.push(moment(vm.dates.start).add(i, 'days').format('DD.MM.YYYY'));
            }

            for (let i = 0; i < countDays; i++) {
                rows[moment(vm.dates.start).add(i, 'days').format('YYYY-MM-DD')] = 0;
                trustDates.push(moment(vm.dates.start).add(i, 'days').format('YYYY-MM-DD'));
            }

            Statistics.getAllStatistics(sendData, function(response) {
                if (response.success) {
                    let statRows = [];
                    let stats = [];
                    vm.statistics = _.chain(response.data)
                                    .map(function(item) {
                                        stats = [];

                                        item.stats = _.reduce(item.Sessions, function(result, value, key) {
                                            stats = stats.concat(value.Stats);

                                            return result;
                                        }, {});

                                        statRows = angular.copy(rows);

                                        _.forEach(stats, function(value, key) {
                                            if (trustDates.indexOf(value.creation_day) !== -1) {
                                                statRows[value.creation_day] += value.work_time;
                                            }
                                        });

                                        if (vm.dates.format == 'month') {
                                            weekRows = {};
                                            _.forEach(rangeData.weeks, function(value, weekKey) {
                                                weekRows[value[0]] = 0;
                                                _.forEach(statRows, function(val, day) {
                                                    if (moment(value[0]).isSameOrBefore(day) && moment(value[1]).isSameOrAfter(day)) {
                                                        weekRows[value[0]] += val;
                                                    }
                                                });
                                            });
                                        }

                                        statRows['sum'] = _.reduce(statRows, function(a, b) {return a + b;}, 0);
                                        weekRows['sum'] = _.reduce(weekRows, function(a, b) {return a + b;}, 0);
                                        item.stats = statRows;
                                        item.weeks = weekRows;

                                        delete item.Sessions;

                                        return item;
                                    })
                                    .value();
                }
            });
        };

        function getDateRange (date, format) {
            date = date ? new Date(date) : new Date();
            format = format || 'week';
            let month = '';
            let endDate = '';
            let startDate = '';

            month = moment(date).format('MMMM YYYY');
            month = month.charAt(0).toUpperCase() + month.slice(1);

            endDate = moment(date).endOf(format).toISOString();
            startDate = moment(date).startOf(format).toISOString();

            return {start: startDate, end: endDate, month: month, format: format};
        };

        function getWeeksInMonth (start) {
            let current = moment(new Date(start));
            let month = moment(new Date(start)).format('MM');
            let weeks = [];
            let title = [];

            weeks.push({0:current.startOf('week').format('YYYY-MM-DD'), 1:current.endOf('week').format('YYYY-MM-DD')});
            title.push({0:current.startOf('week').format('DD.MM.YYYY'), 1:current.endOf('week').format('DD.MM.YYYY')});

            while (moment(new Date(weeks[weeks.length - 1][1])).format('MM') == month) {
                current = moment(new Date(weeks[weeks.length - 1][1])).add(1, 'days');

                weeks.push({0:current.startOf('week').format('YYYY-MM-DD'), 1:current.endOf('week').format('YYYY-MM-DD')});
                title.push({0:current.startOf('week').format('DD.MM.YYYY'), 1:current.endOf('week').format('DD.MM.YYYY')});
            }

            return {weeks: weeks, title: title};
        };

        function goToStat (user, day) {
            if (day !== 'sum') {
                $state.go('admin.workdiary', {id: user, day: day});
            }
        };

        function goToWeek (day) {
            if (day !== 'sum') {
                $state.go('admin.general-statistics', {format: null, day: null}, {notify: false});
                saveDates(day, 'week');
            }
        };

        function changeFormat () {
            if (vm.dates.format == 'month') {
                $state.go('admin.general-statistics', {format: 'month', day: moment(new Date(vm.dates.start)).format('YYYY-MM-DD')}, {notify: false});
            } else {
                $state.go('admin.general-statistics', {format: null, day: null}, {notify: false});
            }

            saveDates(vm.dates.start, vm.dates.format);
        };

        function resetToWeek () {
            $state.go('admin.general-statistics', {format: null, day: null}, {notify: false});
            saveDates(new Date(), 'week');
        };

        function saveDates (day, format) {
            vm.dates = getDateRange(day, format);
            localStorageService.set(user._id + '-statistics-dates', vm.dates);
            loadData();
            setDatesInInputs();
        };

        function nextDate () {
            saveDates(moment(new Date(vm.dates.end)).add(1, vm.dates.format).toISOString(), vm.dates.format);
        };

        function previousDate () {
            saveDates(moment(new Date(vm.dates.start)).add(-1, vm.dates.format).toISOString(), vm.dates.format);
        };

        function getClassForWeek(stat, day) {
            if (day == 'sum' && stat != 0) {
                return 'purple-color font-bold';
            } else if (stat >= 28800) {
                return 'green-color click-time-cell'
            } else if (stat < 28800 && stat != 0) {
                return 'yellow-color click-time-cell'
            } else {
                return 'click-time-cell'
            }
        };

        function getClassForMonth(stat, day) {
            if (day == 'sum' && stat != 0) {
                return 'purple-color font-bold';
            } else if (stat >= 144000) {
                return 'green-color click-time-cell'
            } else if (stat < 144000 && stat != 0) {
                return 'yellow-color click-time-cell'
            } else {
                return 'click-time-cell'
            }
        };
    }
}());