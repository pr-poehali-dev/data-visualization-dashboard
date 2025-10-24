import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface DataRow {
  [key: string]: string | number;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        toast({
          title: 'Ошибка',
          description: 'Загрузите файл Excel (.xlsx, .xls) или CSV',
          variant: 'destructive',
        });
        return;
      }

      setUploadedFile(file.name);
      
      const mockData: DataRow[] = [
        { category: 'Продажи', q1: 45000, q2: 52000, q3: 48000, q4: 61000, region: 'Москва' },
        { category: 'Маркетинг', q1: 12000, q2: 15000, q3: 18000, q4: 22000, region: 'Москва' },
        { category: 'Продажи', q1: 38000, q2: 41000, q3: 44000, q4: 47000, region: 'СПб' },
        { category: 'Маркетинг', q1: 9000, q2: 11000, q3: 13000, q4: 16000, region: 'СПб' },
        { category: 'Продажи', q1: 25000, q2: 28000, q3: 31000, q4: 35000, region: 'Казань' },
        { category: 'Маркетинг', q1: 6000, q2: 7500, q3: 9000, q4: 11000, region: 'Казань' },
      ];
      
      setDataRows(mockData);
      setColumns(Object.keys(mockData[0]));
      
      toast({
        title: 'Успешно!',
        description: `Файл ${file.name} загружен. Обработано ${mockData.length} записей.`,
      });
      
      setActiveTab('dashboard');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  const getMetrics = () => {
    if (dataRows.length === 0) return [];
    
    const totalSales = dataRows.reduce((sum, row) => {
      if (row.category === 'Продажи') {
        return sum + Number(row.q1) + Number(row.q2) + Number(row.q3) + Number(row.q4);
      }
      return sum;
    }, 0);

    const totalMarketing = dataRows.reduce((sum, row) => {
      if (row.category === 'Маркетинг') {
        return sum + Number(row.q1) + Number(row.q2) + Number(row.q3) + Number(row.q4);
      }
      return sum;
    }, 0);

    return [
      { label: 'Общие продажи', value: totalSales, icon: 'TrendingUp', color: 'from-indigo-500 to-purple-600' },
      { label: 'Маркетинг', value: totalMarketing, icon: 'Target', color: 'from-pink-500 to-rose-600' },
      { label: 'Записей', value: dataRows.length, icon: 'Database', color: 'from-blue-500 to-cyan-600' },
      { label: 'Регионов', value: new Set(dataRows.map(r => r.region)).size, icon: 'MapPin', color: 'from-violet-500 to-indigo-600' },
    ];
  };

  const getChartData = (): ChartData[] => {
    if (dataRows.length === 0) return [];
    
    const salesByRegion = dataRows.reduce((acc, row) => {
      if (row.category === 'Продажи') {
        const region = String(row.region);
        const total = Number(row.q1) + Number(row.q2) + Number(row.q3) + Number(row.q4);
        acc[region] = (acc[region] || 0) + total;
      }
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#6366F1', '#EC4899', '#8B5CF6', '#06B6D4'];
    return Object.entries(salesByRegion).map(([label, value], idx) => ({
      label,
      value,
      color: colors[idx % colors.length]
    }));
  };

  const getFilteredData = () => {
    if (!dataRows.length) return [];
    
    let filtered = [...dataRows];
    
    if (filterColumn && searchTerm) {
      filtered = filtered.filter(row => 
        String(row[filterColumn]).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">DataViz Dashboard</h1>
              <p className="text-muted-foreground">Мощная аналитика ваших данных</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm px-4 py-2">
                <Icon name="Sparkles" size={16} className="mr-2 text-primary" />
                Интерактивно
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/60 backdrop-blur-md border border-white/20 shadow-lg">
              <TabsTrigger value="home" className="gap-2">
                <Icon name="Home" size={18} />
                Главная
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Icon name="Upload" size={18} />
                Загрузка
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2" disabled={!uploadedFile}>
                <Icon name="BarChart3" size={18} />
                Дашборд
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2" disabled={!uploadedFile}>
                <Icon name="PieChart" size={18} />
                Аналитика
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2" disabled={!uploadedFile}>
                <Icon name="FileText" size={18} />
                Отчеты
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Icon name="Settings" size={18} />
                Настройки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="mt-8 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6 hover-lift bg-white/70 backdrop-blur-sm border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                      <Icon name="Upload" size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Загрузите данные</h3>
                      <p className="text-sm text-muted-foreground">Поддержка Excel и CSV файлов</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover-lift bg-white/70 backdrop-blur-sm border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
                      <Icon name="Filter" size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Фильтруйте</h3>
                      <p className="text-sm text-muted-foreground">Гибкие фильтры и поиск</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover-lift bg-white/70 backdrop-blur-sm border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                      <Icon name="TrendingUp" size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Визуализируйте</h3>
                      <p className="text-sm text-muted-foreground">Красивые графики и диаграммы</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="mt-8 p-8 bg-gradient-primary text-white hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Готовы начать?</h2>
                    <p className="opacity-90">Загрузите ваш Excel файл и получите инсайты за секунды</p>
                  </div>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => setActiveTab('upload')}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <Icon name="Rocket" size={20} className="mr-2" />
                    Загрузить данные
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="mt-8 animate-fade-in">
              <Card className="p-12 bg-white/70 backdrop-blur-sm border-white/20">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center hover:border-primary/60 transition-all hover:bg-accent/50 cursor-pointer"
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-glow">
                      <Icon name="Upload" size={36} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">Перетащите файл сюда</h3>
                    <p className="text-muted-foreground mb-6">или нажмите для выбора</p>
                    <Button className="bg-gradient-primary text-white hover:opacity-90">
                      <Icon name="FolderOpen" size={18} className="mr-2" />
                      Выбрать файл
                    </Button>
                    <p className="text-sm text-muted-foreground mt-6">
                      Поддерживаются форматы: .xlsx, .xls, .csv
                    </p>
                  </label>
                </div>

                {uploadedFile && (
                  <div className="mt-8 p-6 bg-accent rounded-xl border border-primary/20 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon name="FileSpreadsheet" size={24} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{uploadedFile}</p>
                          <p className="text-sm text-muted-foreground">Файл успешно загружен</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        <Icon name="CheckCircle" size={14} className="mr-1" />
                        Готово
                      </Badge>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="mt-8 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {getMetrics().map((metric, idx) => (
                  <Card key={idx} className="p-6 hover-lift bg-white/70 backdrop-blur-sm border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color}`}>
                        <Icon name={metric.icon as any} size={24} className="text-white" />
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Icon name="TrendingUp" size={12} className="mr-1" />
                        +12%
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">
                      {metric.label === 'Записей' || metric.label === 'Регионов' 
                        ? metric.value 
                        : `${(metric.value / 1000).toFixed(0)}K`}
                    </h3>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Продажи по регионам</h3>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Период" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всё время</SelectItem>
                        <SelectItem value="q4">Q4 2024</SelectItem>
                        <SelectItem value="q3">Q3 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    {chartData.map((item, idx) => (
                      <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {(item.value / 1000).toFixed(0)}K ₽
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${(item.value / maxValue) * 100}%`,
                              background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
                  <h3 className="text-lg font-semibold mb-6">Распределение по категориям</h3>
                  <div className="relative h-64 flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      {chartData.map((item, idx) => {
                        const total = chartData.reduce((sum, d) => sum + d.value, 0);
                        const percentage = (item.value / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const prevAngles = chartData.slice(0, idx).reduce((sum, d) => {
                          return sum + ((d.value / total) * 360);
                        }, 0);
                        
                        return (
                          <div
                            key={idx}
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(from ${prevAngles}deg, ${item.color} 0deg, ${item.color} ${angle}deg, transparent ${angle}deg)`,
                              opacity: 0.8
                            }}
                          />
                        );
                      })}
                      <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gradient">100%</div>
                          <div className="text-xs text-muted-foreground">Данные</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {chartData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-8 animate-fade-in">
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Фильтр по колонке</label>
                    <Select value={filterColumn} onValueChange={setFilterColumn}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите колонку" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Поиск</label>
                    <Input
                      placeholder="Введите значение..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={!filterColumn}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilterColumn('');
                        setSearchTerm('');
                      }}
                    >
                      <Icon name="X" size={18} className="mr-2" />
                      Сбросить
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {columns.map(col => (
                          <th key={col} className="text-left py-3 px-4 font-semibold text-sm">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredData().map((row, idx) => (
                        <tr key={idx} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                          {columns.map(col => (
                            <td key={col} className="py-3 px-4 text-sm">
                              {typeof row[col] === 'number' ? row[col].toLocaleString() : row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Показано записей: {getFilteredData().length} из {dataRows.length}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-8 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6 hover-lift bg-white/70 backdrop-blur-sm border-white/20">
                  <Icon name="FileText" size={32} className="text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Экспорт в Excel</h3>
                  <p className="text-muted-foreground mb-4">Скачайте текущие данные в формате XLSX</p>
                  <Button className="bg-gradient-primary text-white">
                    <Icon name="Download" size={18} className="mr-2" />
                    Скачать Excel
                  </Button>
                </Card>

                <Card className="p-6 hover-lift bg-white/70 backdrop-blur-sm border-white/20">
                  <Icon name="FileJson" size={32} className="text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Экспорт в CSV</h3>
                  <p className="text-muted-foreground mb-4">Сохраните данные в формате CSV</p>
                  <Button variant="outline">
                    <Icon name="Download" size={18} className="mr-2" />
                    Скачать CSV
                  </Button>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-8 animate-fade-in">
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
                <h3 className="text-xl font-semibold mb-6">Настройки дашборда</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тема оформления</label>
                    <Select defaultValue="light">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Светлая</SelectItem>
                        <SelectItem value="dark">Тёмная</SelectItem>
                        <SelectItem value="auto">Авто</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Язык интерфейса</label>
                    <Select defaultValue="ru">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="bg-gradient-primary text-white">
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить настройки
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </header>
      </div>
    </div>
  );
};

export default Index;